package com.bp3.backend.dto;

import com.bp3.backend.model.EdgeImpl;
import com.bp3.backend.model.NodeImpl;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BpmnProcessDataRequestDto(@NotEmpty List<NodeImpl> nodes,
                                        @NotEmpty List<EdgeImpl> edges) {

}
