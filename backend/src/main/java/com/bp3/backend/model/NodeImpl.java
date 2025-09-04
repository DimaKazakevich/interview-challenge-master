package com.bp3.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;

public class NodeImpl implements Node {

    @NotBlank
    private String id;
    @NotBlank
    private String name;
    @NotNull
    private NodeType type;

    @Override
    public String getId() {
        return id;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void setName(String name) {
        this.name = name;
    }

    @Override
    public NodeType getType() {
        return type;
    }

    @Override
    public void setType(NodeType type) {
        this.type = type;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        NodeImpl node = (NodeImpl) o;
        return Objects.equals(id, node.id) && Objects.equals(name, node.name)
                && type == node.type;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, type);
    }
}
