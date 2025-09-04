package com.bp3.backend.dto;

import com.bp3.backend.model.EdgeImpl;
import com.bp3.backend.model.NodeImpl;
import java.util.List;

public record BpmnProcessDataResponseDto(List<NodeImpl> nodes, List<EdgeImpl> edges) {

}
