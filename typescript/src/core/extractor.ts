import { parseAndGenerateServices } from "@typescript-eslint/typescript-estree";
import * as fs from "fs";
import path from "path";
import { TypeChecker } from "typescript";
import { Presets, SingleBar } from "cli-progress";

import { ConceptMap, LCEConcept, mergeConceptMaps, singleEntryConceptMap, unifyConceptMap } from "./concept";
import { LCEProject } from "./concepts/typescript-project.concept";
import { GlobalContext } from "./context";
import { PathUtils } from "./utils/path.utils";
import { AstTraverser } from "./traversers/ast.traverser";
import { FileUtils } from "./utils/file.utils";
import { POST_PROCESSORS } from "./features";

// eslint-disable-next-line @typescript-eslint/ban-types
export async function processProject(projectRoot: string): Promise<Map<string, LCEConcept[]>> {
    projectRoot = path.resolve(projectRoot);
    const fileList = FileUtils.getProjectSourceFileList(projectRoot);

    // maps filenames to the extracted concepts from these files
    let concepts: ConceptMap = singleEntryConceptMap(LCEProject.conceptId, new LCEProject(projectRoot.replace(/\\/g, "/")));

    console.log("Analyzing " + fileList.length + " project files...");
    const startTime = process.hrtime();
    let fileReadingTime = 0;
    const progressBar = new SingleBar({}, Presets.shades_classic);
    progressBar.start(fileList.length, 0);

    // Traverse and process all individual project files
    const traverser = new AstTraverser();
    for (let i = 0; i < fileList.length; i++){
        progressBar.update(i+1);
        const file = fileList[i];

        const frStartTime = process.hrtime();
        const code: string = fs.readFileSync(file, "utf8");
        const frEndTime = process.hrtime();
        fileReadingTime += (frEndTime[0] + frEndTime[1]/10**9) - (frStartTime[0] + frStartTime[1]/10**9);

        try {
            const {ast, services} = parseAndGenerateServices(code, {
                loc: true,
                range: true,
                tokens: false,
                filePath: file,
                project: path.join(projectRoot, "tsconfig.json"),
            });
            if (!services.program) {
                continue;
            }
            const typeChecker: TypeChecker = services.program.getTypeChecker();

            const globalContext: GlobalContext = {
                projectRootPath: projectRoot.replace(/\\/g, "/"),
                sourceFilePath: PathUtils.normalize(projectRoot, file).replace(/\\/g, "/"),
                ast: ast,
                services: services,
                typeChecker: typeChecker,
            };

            concepts = mergeConceptMaps(concepts, unifyConceptMap(traverser.traverse(globalContext), globalContext.sourceFilePath));
        } catch(e) {
            console.log("Error occurred while processing file: " + file);
            console.log(e);
        }
    }
    progressBar.stop();
    const normalizedConcepts = unifyConceptMap(concepts, "").get("") ?? new Map();

    // Post-process for project-wide concepts
    console.log("Post-Processing Results...")
    for(const postProcessor of POST_PROCESSORS) {
        postProcessor.postProcess(normalizedConcepts, projectRoot.replace(/\\/g, "/"),);
    }

    const endTime = process.hrtime();
    const diffTime = (endTime[0] + endTime[1]/10**9) - (startTime[0] + startTime[1]/10**9);
    console.log("Finished analyzing project files.");
    console.log("Runtime: " + diffTime.toFixed(3) + "s (" + fileReadingTime.toFixed(3) + "s reading files)");

    return normalizedConcepts;
}

export async function processAndOutputResult(projectRoot: string, options: ExtractorOptions) {
    // process project
    const normalizedConcepts = await processProject(projectRoot);

    // output JSON file
    if (normalizedConcepts) {
        const json = JSON.stringify(Object.fromEntries(normalizedConcepts), (_, value) => {
            if(typeof  value === 'bigint') {
                return value.toString();
            } else if(typeof value === 'object' && value instanceof Map) {
                return Object.fromEntries(Array.from(value.entries()))
            } else {
                return value;
            }

        }, options.prettyPrint ? 2 : undefined);
        let dirPath = path.join(projectRoot, ".reports", "jqa");
        let filePath = path.join(dirPath, 'ts-output.json');
        fs.mkdir(dirPath, {recursive: true}, (errDir) => {
            if (errDir) {
                console.log("Could not create directory: " + dirPath);
            } else {
                fs.writeFile(filePath, json, (err) => {
                    if (err) {
                        console.log("Error writing JSON: " + err);
                    } else {
                        console.log("JSON result successfully written to " + filePath);
                    }
                });
            }
        })

    }
}

export interface ExtractorOptions {
    prettyPrint?: boolean;
}
