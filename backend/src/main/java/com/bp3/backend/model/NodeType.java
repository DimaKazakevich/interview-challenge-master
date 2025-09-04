package com.bp3.backend.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;

/**
 * The different types of {@link Node}s within a BPM process diagram.
 */
public enum NodeType {
    GATEWAY, END, HUMAN_TASK, SERVICE_TASK, START;

    @JsonCreator
    public static NodeType fromJson(String value) {
        if (value == null) {
            throw new IllegalArgumentException("NodeType is null");
        }

        // Convert from (e.g. "HumanTask") to ("HUMAN_TASK")
        String normalized = value
                .replaceAll("([a-z])([A-Z])", "$1_$2")
                .toUpperCase();

        return Arrays.stream(NodeType.values())
                .filter(t -> t.name().equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown NodeType: " + value));
    }

    // Convert to (e.g. "HUMAN_TASK") to ("HumanTask")
    @JsonValue
    public String toJson() {
        String[] parts = this.name().toLowerCase().split("_");
        StringBuilder sb = new StringBuilder();

        for (String part : parts) {
            sb.append(part.substring(0, 1).toUpperCase()).append(part.substring(1));
        }

        return sb.toString();
    }
}
