package org.jqassistant.plugin.typescript.impl.mapper;

import java.util.List;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;

import org.jqassistant.plugin.typescript.api.model.PropertyDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.PropertyDeclaration;
import org.mapstruct.*;

@Mapper(uses = {DecoratorMapper.class, TypeMapper.class})
public interface PropertyDeclarationMapper extends
        DescriptorMapper<PropertyDeclaration, PropertyDeclarationDescriptor> {

    @Override
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(source = "abstractt", target = "abstract")
    @Mapping(source = "staticc", target = "static")
    @Mapping(source = "propertyName", target = "name")
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    PropertyDeclarationDescriptor toDescriptor(PropertyDeclaration value, @Context Scanner scanner);

    @AfterMapping
    default void registerFqn(PropertyDeclaration type, @MappingTarget PropertyDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
    }

    List<PropertyDeclarationDescriptor> mapList(List<PropertyDeclaration> value, @Context Scanner scanner);
}
