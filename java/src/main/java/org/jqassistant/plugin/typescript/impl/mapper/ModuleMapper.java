package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.jqassistant.plugin.common.api.scanner.FileResolver;
import lombok.extern.slf4j.Slf4j;
import org.jqassistant.plugin.typescript.api.model.*;
import org.jqassistant.plugin.typescript.impl.model.Module;
import org.jqassistant.plugin.typescript.impl.model.ScanResultCollection;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class ModuleMapper {

    public static final ModuleMapper INSTANCE = new ModuleMapper();

    public List<ModuleDescriptor> map(ScanResultCollection scanResultCollection, Scanner scanner) {
        FileResolver fileResolver = scanner.getContext().peek(FileResolver.class);
        List<ModuleDescriptor> result = new ArrayList<>();

        scanner.getContext().push(TypeParameterResolver.class, new TypeParameterResolver());

        Map<String, List<ClassDeclarationDescriptor>> classDeclarations = new HashMap<>();
        ClassDeclarationMapper.INSTANCE.mapList(scanResultCollection.getClassDeclarations(), scanner)
            .forEach(classDeclarationDescriptor -> {
                classDeclarations.merge(classDeclarationDescriptor.getFileName(), new ArrayList<>(List.of(classDeclarationDescriptor)), (o, n) -> {
                    o.addAll(n);
                    return  o;
                });
            });

        Map<String, List<InterfaceDeclarationDescriptor>> interfaceDeclarations = new HashMap<>();
        InterfaceDeclarationMapper.INSTANCE.mapList(scanResultCollection.getInterfaceDeclarations(), scanner)
            .forEach(interfaceDeclarationDescriptor -> {
                interfaceDeclarations.merge(interfaceDeclarationDescriptor.getFileName(), new ArrayList<>(List.of(interfaceDeclarationDescriptor)), (o, n) -> {
                    o.addAll(n);
                    return  o;
                });
            });

        Map<String, List<TypeAliasDeclarationDescriptor>> typeAliasDeclarations = new HashMap<>();
        TypeAliasDeclarationMapper.INSTANCE.mapList(scanResultCollection.getTypeAliasDeclarations(), scanner)
            .forEach(typeAliasDeclarationDescriptor -> {
                typeAliasDeclarations.merge(typeAliasDeclarationDescriptor.getFileName(), new ArrayList<>(List.of(typeAliasDeclarationDescriptor)), (o, n) -> {
                    o.addAll(n);
                    return  o;
                });
            });

        Map<String, List<EnumDeclarationDescriptor>> enumDeclarations = new HashMap<>();
        EnumDeclarationMapper.INSTANCE.mapList(scanResultCollection.getEnumDeclarations(), scanner)
            .forEach(enumDeclarationDescriptor -> {
                enumDeclarations.merge(enumDeclarationDescriptor.getFileName(), new ArrayList<>(List.of(enumDeclarationDescriptor)), (o, n) -> {
                    o.addAll(n);
                    return  o;
                });
            });

        Map<String, List<FunctionDeclarationDescriptor>> functionDeclarations = new HashMap<>();
        FunctionDeclarationMapper.INSTANCE.mapList(scanResultCollection.getFunctionDeclarations(), scanner)
            .forEach(functionDeclarationDescriptor -> {
                functionDeclarations.merge(functionDeclarationDescriptor.getFileName(), new ArrayList<>(List.of(functionDeclarationDescriptor)), (o, n) -> {
                    o.addAll(n);
                    return  o;
                });
            });

        Map<String, List<VariableDeclarationDescriptor>> variableDeclarations = new HashMap<>();
        VariableDeclarationMapper.INSTANCE.mapList(scanResultCollection.getVariableDeclarations(), scanner)
            .forEach(variableDeclarationDescriptor -> {
                variableDeclarations.merge(variableDeclarationDescriptor.getFileName(), new ArrayList<>(List.of(variableDeclarationDescriptor)), (o, n) -> {
                    o.addAll(n);
                    return  o;
                });
            });

        for(Module module : scanResultCollection.getModules()) {
            FileDescriptor fileDescriptor = fileResolver.match(module.getPath(), FileDescriptor.class, scanner.getContext());
            if(fileDescriptor != null) { // only represent modules in the graph that were previously scanned in the file system
                ModuleDescriptor moduleDescriptor = scanner.getContext().getStore().addDescriptorType(fileDescriptor, ModuleDescriptor.class);
                moduleDescriptor.setFqn(module.getFqn());

                moduleDescriptor.getTypeAliasDeclarations().addAll(typeAliasDeclarations.getOrDefault(module.getPath(), new ArrayList<>(List.of())));
                moduleDescriptor.getClassDeclarations().addAll(classDeclarations.getOrDefault(module.getPath(), new ArrayList<>(List.of())));
                moduleDescriptor.getInterfaceDeclarations().addAll(interfaceDeclarations.getOrDefault(module.getPath(), new ArrayList<>(List.of())));
                moduleDescriptor.getEnumDeclarations().addAll(enumDeclarations.getOrDefault(module.getPath(), new ArrayList<>(List.of())));
                moduleDescriptor.getFunctionDeclarations().addAll(functionDeclarations.getOrDefault(module.getPath(), new ArrayList<>(List.of())));
                moduleDescriptor.getVariableDeclarations().addAll(variableDeclarations.getOrDefault(module.getPath(), new ArrayList<>(List.of())));

                scanner.getContext().peek(FqnResolver.class).registerFqn(moduleDescriptor);
                result.add(moduleDescriptor);
            }
        }

        scanner.getContext().pop(TypeParameterResolver.class);

        return result;
    }

}
