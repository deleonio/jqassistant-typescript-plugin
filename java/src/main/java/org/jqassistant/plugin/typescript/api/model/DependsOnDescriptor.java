package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Relation("DEPENDS_ON")
public interface DependsOnDescriptor extends Descriptor {

    @Relation.Incoming
    TypeScriptDescriptor getDependent();

    @Relation.Outgoing
    TypeScriptDescriptor getDependency();

    Integer getCardinality();
    void setCardinality(Integer cardinality);

}
