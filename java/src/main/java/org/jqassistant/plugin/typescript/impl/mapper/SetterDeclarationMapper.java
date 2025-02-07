package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.SetterDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.SetterDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(uses = {TypeMapper.class, ParameterDeclarationMapper.class, DecoratorMapper.class})
public interface SetterDeclarationMapper extends
        DescriptorMapper<SetterDeclaration, SetterDeclarationDescriptor> {

    @Override
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(source = "abstractt", target = "abstract")
    @Mapping(source = "staticc", target = "static")
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    SetterDeclarationDescriptor toDescriptor(SetterDeclaration value, @Context Scanner scanner);

    List<SetterDeclarationDescriptor> mapList(List<SetterDeclaration> value, @Context Scanner scanner);

}
