package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("AccessorProperty")
public interface AccessorPropertyDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor {

    String getName();
    void setName(String name);

    @Relation("DESCRIBED_BY_GETTER")
    GetterDeclarationDescriptor getGetter();
    void setGetter(GetterDeclarationDescriptor getter);

    @Relation("DESCRIBED_BY_SETTER")
    SetterDeclarationDescriptor getSetter();
    void setSetter(SetterDeclarationDescriptor setter);

    @Relation("DESCRIBED_BY_AUTO_ACCESSOR")
    AutoAccessorDeclarationDescriptor getAutoAccessor();
    void setAutoAccessor(AutoAccessorDeclarationDescriptor autoAccessor);

}
