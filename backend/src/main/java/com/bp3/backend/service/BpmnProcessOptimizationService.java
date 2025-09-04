package com.bp3.backend.service;

import com.bp3.backend.model.Edge;
import com.bp3.backend.model.Node;
import com.bp3.backend.model.NodeType;
import com.bp3.backend.dto.BpmnProcessDataRequestDto;
import com.bp3.backend.dto.BpmnProcessDataResponseDto;
import com.bp3.backend.model.EdgeImpl;
import com.bp3.backend.model.NodeImpl;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class BpmnProcessOptimizationService implements
        ProcessOptimizationService<BpmnProcessDataRequestDto, BpmnProcessDataResponseDto> {

    @Override
    public BpmnProcessDataResponseDto optimize(BpmnProcessDataRequestDto requestDto) {
        validateGraph(requestDto.nodes(), requestDto.edges());

        List<NodeImpl> nodes = requestDto.nodes();
        List<EdgeImpl> edges = requestDto.edges();

        // Keep only START, END, HUMAN_TASK
        List<NodeImpl> filteredNodes = nodes.stream()
                .filter(node -> node.getType() == NodeType.START
                        || node.getType() == NodeType.END
                        || node.getType() == NodeType.HUMAN_TASK)
                .collect(Collectors.toList());

        Set<String> validNodeIds = filteredNodes.stream()
                .map(Node::getId)
                .collect(Collectors.toSet());

        List<EdgeImpl> rebuiltEdges = rebuildEdges(edges, validNodeIds);

        return new BpmnProcessDataResponseDto(filteredNodes, rebuiltEdges);
    }

    @Override
    public BpmnProcessDataResponseDto optimizeFile(BpmnProcessDataRequestDto requestDto) {
        return optimize(requestDto);
    }

    private void validateGraph(List<NodeImpl> nodes, List<EdgeImpl> edges) {
        Set<String> nodeIds = nodes.stream().map(Node::getId).collect(Collectors.toSet());

        for (EdgeImpl edge : edges) {
            if (!nodeIds.contains(edge.getFrom()) || !nodeIds.contains(edge.getTo())) {
                throw new IllegalArgumentException("Edge references unknown node: " + edge);
            }
        }

        long startCount = nodes.stream().filter(n -> n.getType() == NodeType.START).count();
        long endCount = nodes.stream().filter(n -> n.getType() == NodeType.END).count();

        if (startCount != 1 || endCount != 1) {
            throw new IllegalArgumentException("Graph must contain exactly one Start and one End node.");
        }
    }

    private List<EdgeImpl> rebuildEdges(List<EdgeImpl> allEdges, Set<String> validNodeIds) {
        Map<String, List<String>> adjacency = new HashMap<>();
        for (EdgeImpl edge : allEdges) {
            adjacency.computeIfAbsent(edge.getFrom(), k -> new ArrayList<>()).add(edge.getTo());
        }

        List<EdgeImpl> result = new ArrayList<>();

        for (String fromId : validNodeIds) {
            Set<String> visited = new HashSet<>();
            Deque<String> stack = new ArrayDeque<>(adjacency.getOrDefault(fromId, List.of()));

            while (!stack.isEmpty()) {
                String current = stack.pop();
                if (!visited.add(current)) {
                    continue;
                }

                if (validNodeIds.contains(current)) {
                    result.add(new EdgeImpl(fromId, current));
                } else {
                    stack.addAll(adjacency.getOrDefault(current, List.of()));
                }
            }
        }

        return result;
    }
}
