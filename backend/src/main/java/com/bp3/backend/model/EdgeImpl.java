package com.bp3.backend.model;

import jakarta.validation.constraints.NotBlank;
import java.util.Objects;

public class EdgeImpl implements Edge {

    public EdgeImpl() {

    }

    public EdgeImpl(String from, String to) {
        this.from = from;
        this.to = to;
    }

    @NotBlank
    private String from;
    @NotBlank
    private String to;

    @Override
    public String getFrom() {
        return from;
    }

    @Override
    public void setFrom(String from) {
        this.from = from;
    }

    @Override
    public String getTo() {
        return to;
    }

    @Override
    public void setTo(String to) {
        this.to = to;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        EdgeImpl edge = (EdgeImpl) o;
        return Objects.equals(from, edge.from) && Objects.equals(to, edge.to);
    }

    @Override
    public int hashCode() {
        return Objects.hash(from, to);
    }
}
