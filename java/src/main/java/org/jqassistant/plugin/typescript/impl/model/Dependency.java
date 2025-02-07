package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Dependency extends NamedConcept {

    private String targetType;

    private String sourceFQN;

    private String sourceType;

    private Integer cardinality;

}
