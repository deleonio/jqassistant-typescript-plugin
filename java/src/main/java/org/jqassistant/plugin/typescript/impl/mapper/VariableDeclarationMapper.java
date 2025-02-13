package org.jqassistant.plugin.typescript.impl.mapper;

import java.util.List;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;

import org.jqassistant.plugin.typescript.api.model.VariableDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.VariableDeclaration;
import org.mapstruct.*;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class, ValueMapper.class})
public interface VariableDeclarationMapper extends
        DescriptorMapper<VariableDeclaration, VariableDeclarationDescriptor> {

    VariableDeclarationMapper INSTANCE = getMapper(VariableDeclarationMapper.class);

    @Override
    @Mapping(source = "variableName", target = "name")
    @Mapping(source = "coordinates.fileName", target = "fileName")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    VariableDeclarationDescriptor toDescriptor(VariableDeclaration value, @Context Scanner scanner);

    @AfterMapping
    default void registerFqn(VariableDeclaration type, @MappingTarget VariableDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
    }

    List<VariableDeclarationDescriptor> mapList(List<VariableDeclaration> value, @Context Scanner scanner);
}
