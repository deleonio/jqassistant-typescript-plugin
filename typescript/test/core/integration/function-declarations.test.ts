import { processProject } from "../../../src/core/extractor";
import { LCEConcept } from "../../../src/core/concept";
import { LCETypePrimitive, LCETypeUnion } from "../../../src/core/concepts/type.concept";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import {
    expectDeclaredType,
    expectDependency,
    expectFunctionParameter,
    expectObjectType,
    expectObjectTypeMember,
    expectPrimitiveType,
    expectTypeParameterDeclaration,
    expectTypeParameterReference,
    getDependenciesFromResult,
} from "../../utils/test-utils";
import { LCEFunctionDeclaration } from "../../../src/core/concepts/function-declaration.concept";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";

jest.setTimeout(30000);

describe("function declarations test", () => {

    let result: Map<string, LCEConcept[]>;
    const funDecls: Map<string, LCEFunctionDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/function-declarations";
        result = await processProject(projectRoot);

        if(!result.get(LCEFunctionDeclaration.conceptId)) {
            throw new Error("Could not find function declarations in result data.")
        }
        
        for(const concept of (result.get(LCEFunctionDeclaration.conceptId) ?? [])) {
            const funDecl: LCEFunctionDeclaration = concept as LCEFunctionDeclaration;
            if(!funDecl.fqn) {
                throw new Error("Function declaration has no fqn " + JSON.stringify(funDecl));
            }
            if(funDecls.has(funDecl.fqn)) {
                throw new Error("Two function declarations with same FQN were returned: " + funDecl.fqn);
            }
            funDecls.set(funDecl.fqn, funDecl);
        }
        
        const mainModuleConcept = result.get(LCEModule.conceptId)?.find(mod => (mod as LCEModule).fqn === "./src/main.ts");
        if(!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("empty function", async () => {
        const decl = funDecls.get('"./src/main.ts".fEmpty');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fEmpty");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("simple function that returns number", async () => {
        const decl = funDecls.get('"./src/main.ts".fReturn');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fReturn");

            expectPrimitiveType(decl.returnType, "number");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("simple function that returns interface instance", async () => {
        const decl = funDecls.get('"./src/main.ts".fReturnRef');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fReturnRef");

            expectDeclaredType(decl.returnType, '"./src/main.ts".CustomInterface');

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(dependencies, '"./src/main.ts".fReturnRef', '"./src/main.ts".CustomInterface', 1);
    });

    test("simple function that returns interface instance of different module", async () => {
        const decl = funDecls.get('"./src/main.ts".fReturnRefExt');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fReturnRefExt");

            expectDeclaredType(decl.returnType, '"./src/secondary.ts".ExternalCustomInterface');

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(dependencies, '"./src/main.ts".fReturnRefExt', '"./src/secondary.ts".ExternalCustomInterface', 1);
    });

    test("exported empty function", async () => {
        const decl = funDecls.get('"./src/main.ts".fExported');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fExported");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            const exportDeclConcept = result.get(LCEExportDeclaration.conceptId)?.find(exp =>
                (exp as LCEExportDeclaration).declFqn === '"./src/main.ts".fExported');

            expect(exportDeclConcept).toBeDefined();
            if(exportDeclConcept) {
                const exportDecl = exportDeclConcept as LCEExportDeclaration;
                expect(exportDecl.kind).toBe("value");
                expect(exportDecl.identifier).toBe("fExported");
                expect(exportDecl.alias).toBeUndefined();
                expect(exportDecl.isDefault).toBe(false);
                expect(exportDecl.sourceFilePath).toBe(mainModule.fqn);
            }
        }
    });

    test("function with dependencies in body", async () => {
        const decl = funDecls.get('"./src/main.ts".fBodyRef');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fBodyRef");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(dependencies, '"./src/main.ts".fBodyRef', '"./src/main.ts".fEmpty', 1);
        expectDependency(dependencies, '"./src/main.ts".fBodyRef', '"./src/main.ts".CustomClass', 1);
    });

    test("function with single parameter", async () => {
        const decl = funDecls.get('"./src/main.ts".fParam');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fParam");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false, "number");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("function with multiple parameters", async () => {
        const decl = funDecls.get('"./src/main.ts".fMultiParam');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fMultiParam");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(3);
            expectFunctionParameter(decl.parameters, 0, "p1", false, "number");
            expectFunctionParameter(decl.parameters, 1, "p2", false, "string");
            expectFunctionParameter(decl.parameters, 2, "p3", true);

            expect(decl.parameters[2].type).toBeDefined();
            expect(decl.parameters[2].type.type).toBe("union");
            const unionTypes = (decl.parameters[2].type as LCETypeUnion).types;

            expect(unionTypes).toHaveLength(2);
            expect(unionTypes[0].type).toBe("primitive");
            expect(unionTypes[1].type).toBe("primitive");
            unionTypes.sort((a, b) => (a as LCETypePrimitive).name.localeCompare((b as LCETypePrimitive).name))
            expect((unionTypes[0] as LCETypePrimitive).name).toBe("string");
            expect((unionTypes[1] as LCETypePrimitive).name).toBe("undefined");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("function with single parameter of referenced class type", async () => {
        const decl = funDecls.get('"./src/main.ts".fParamRef');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fParamRef");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectDeclaredType(decl.parameters[0]!.type, '"./src/main.ts".CustomClass');

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(dependencies, '"./src/main.ts".fParamRef', '"./src/main.ts".CustomClass', 1);
    });

    test("function with single parameter of referenced class type of different module", async () => {
        const decl = funDecls.get('"./src/main.ts".fParamRefExt');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fParamRefExt");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectDeclaredType(decl.parameters[0]!.type, '"./src/secondary.ts".ExternalCustomClass');

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(dependencies, '"./src/main.ts".fParamRefExt', '"./src/secondary.ts".ExternalCustomClass', 1);
    });

    test("generic function with single type parameter", async () => {
        const decl = funDecls.get('"./src/main.ts".fGeneric');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fGeneric");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T");
        }
    });

    test("generic function with multiple type parameters", async () => {
        const decl = funDecls.get('"./src/main.ts".fGenericMulti');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fGenericMulti");

            expectTypeParameterReference(decl.returnType, "U");

            expect(decl.parameters).toHaveLength(2);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectFunctionParameter(decl.parameters, 1, "p2", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");
            expectTypeParameterReference(decl.parameters[1]!.type, "U");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(2);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T");
            expectTypeParameterDeclaration(decl.typeParameters, 1, "U");
        }
    });

    test("generic function with constrained type parameter", async () => {
        const decl = funDecls.get('"./src/main.ts".fGenericConstraint');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fGenericConstraint");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T", false);
            expect(decl.typeParameters[0].constraint).toBeDefined();
            const constraint = expectObjectType(decl.typeParameters[0].constraint, 1);
            expectObjectTypeMember(constraint, "x", false, false, "number");
        }
    });

    test("generic function with type parameter constrained by type declaration", async () => {
        const decl = funDecls.get('"./src/main.ts".fGenericConstraintRef');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fGenericConstraintRef");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T", false);
            expectDeclaredType(decl.typeParameters[0].constraint, '"./src/main.ts".CustomInterface');
        }

        expectDependency(dependencies, '"./src/main.ts".fGenericConstraintRef', '"./src/main.ts".CustomInterface', 1);
    });

    test("generic function with type parameter constrained by type declaration of different module", async () => {
        const decl = funDecls.get('"./src/main.ts".fGenericConstraintRefExt');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fGenericConstraintRefExt");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T", false);
            expectDeclaredType(decl.typeParameters[0].constraint, '"./src/secondary.ts".ExternalCustomInterface');
        }

        expectDependency(dependencies, '"./src/main.ts".fGenericConstraintRefExt', '"./src/secondary.ts".ExternalCustomInterface', 1);
    });

    test("nested function", async () => {
        const decl = funDecls.get('"./src/main.ts".fNested');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fNested");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("async function", async () => {
        const decl = funDecls.get('"./src/main.ts".fAsync');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("fAsync");

            const returnType = expectDeclaredType(decl.returnType, "Promise", false);
            expect(returnType.typeArguments).toHaveLength(1);
            expectPrimitiveType(returnType.typeArguments[0], "number");

            expect(decl.parameters).toHaveLength(2);
            expectFunctionParameter(decl.parameters, 0, "p1", false, "string");
            expectFunctionParameter(decl.parameters, 1, "p2", false, "number");

            expect(decl.async).toBe(true);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

});
