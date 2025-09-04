package com.bp3.backend.service;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.bp3.backend.dto.BpmnProcessDataRequestDto;
import com.bp3.backend.dto.BpmnProcessDataResponseDto;
import com.bp3.backend.model.EdgeImpl;
import com.bp3.backend.model.NodeImpl;
import com.bp3.backend.model.NodeType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class BpmnProcessOptimizationServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final BpmnProcessOptimizationService service = new BpmnProcessOptimizationService();

    /**
     * simple-process check
     *
     * @throws Exception
     */
    @Test
    void shouldOptimizeProcessCorrectly() throws Exception {
        // given: JSON input from resources
        InputStream jsonStream = getClass().getResourceAsStream("/1-simple-process.json");
        assertNotNull(jsonStream, "JSON file not found");

        BpmnProcessDataRequestDto request = objectMapper.readValue(jsonStream,
                BpmnProcessDataRequestDto.class);

        // when: optimizing
        BpmnProcessDataResponseDto response = service.optimize(request);

        // then: check filtered nodes
        List<NodeImpl> nodes = response.nodes();
        assertEquals(4, nodes.size());

        assertTrue(nodes.stream().anyMatch(n -> n.getType() == NodeType.START));
        assertTrue(nodes.stream().anyMatch(n -> n.getType() == NodeType.END));
        assertEquals(2, nodes.stream().filter(n -> n.getType() == NodeType.HUMAN_TASK).count());

        // then: check rebuilt edges
        List<EdgeImpl> edges = response.edges();
        assertEquals(3, edges.size());

        assertTrue(edges.contains(new EdgeImpl("0", "2")));
        assertTrue(edges.contains(new EdgeImpl("2", "4")));
        assertTrue(edges.contains(new EdgeImpl("4", "5")));
    }

    /**
     * multiple-human-services check
     *
     * @throws Exception
     */
    @Test
    void shouldRemoveServiceTasksAndRebuildEdges() throws Exception {
        // given: JSON input from resources
        InputStream jsonStream = getClass().getResourceAsStream("/2-multiple-human-services.json");

        assertNotNull(jsonStream, "Test file not found!");

        BpmnProcessDataRequestDto request = objectMapper.readValue(jsonStream,
                BpmnProcessDataRequestDto.class);

        // when: optimizing
        BpmnProcessDataResponseDto result = service.optimize(request);

        // then: check ServiceTask with id 3 is removed
        assertFalse(result.nodes().stream().anyMatch(n -> n.getId().equals("3")),
                "Node with id 3 should be removed");

        // then: check rebuilt edges
        List<EdgeImpl> expectedEdges = List.of(
                new EdgeImpl("0", "1"),
                new EdgeImpl("1", "2"),
                new EdgeImpl("2", "4"),
                new EdgeImpl("4", "5")
        );

        assertEquals(expectedEdges.size(), result.edges().size(), "Edge count mismatch");
        for (EdgeImpl expected : expectedEdges) {
            assertTrue(result.edges().contains(expected), "Missing expected edge: " + expected);
        }
    }

    /**
     * branching-process check
     *
     * @throws Exception
     */
    @Test
    void shouldRemoveServiceTasksAndPreserveBranches() throws Exception {
        // given: JSON input from resources
        InputStream jsonStream = getClass().getResourceAsStream("/3-branching-process.json");

        assertNotNull(jsonStream, "Test file not found");

        BpmnProcessDataRequestDto request = objectMapper.readValue(jsonStream,
                BpmnProcessDataRequestDto.class);

        // Optimize the process
        BpmnProcessDataResponseDto result = service.optimize(request);

        // Expect ServiceTasks (ids 1 and 7) to be removed
        assertFalse(result.nodes().stream().anyMatch(n -> n.getId().equals("1")),
                "Node 1 (ServiceTask) should be removed");
        assertFalse(result.nodes().stream().anyMatch(n -> n.getId().equals("7")),
                "Node 7 (ServiceTask) should be removed");

        // Expect Gateway nodes to be removed too (if not START, END, HUMAN_TASK)
        assertFalse(result.nodes().stream().anyMatch(n -> n.getId().equals("3")),
                "Gateway node 3 should be removed");
        assertFalse(result.nodes().stream().anyMatch(n -> n.getId().equals("6")),
                "Gateway node 6 should be removed");

        // Expect the result to include:
        // 0 -> 2 (via 1)
        // 2 -> 4 (via 3)
        // 2 -> 5 (via 3)
        // 4 -> 8 (via 6 → 7)
        // 5 -> 8 (via 6 → 7)
        List<EdgeImpl> expected = List.of(
                new EdgeImpl("0", "2"),
                new EdgeImpl("2", "4"),
                new EdgeImpl("2", "5"),
                new EdgeImpl("4", "8"),
                new EdgeImpl("5", "8")

        );

        assertEquals(expected.size(), result.edges().size(), "Edge count mismatch");

        for (EdgeImpl edge : expected) {
            assertTrue(result.edges().contains(edge), "Expected edge not found: " + edge);
        }
    }

    /**
     * recursive-branching-process check
     *
     * @throws Exception
     */
    @Test
    void shouldOptimizeProcessWithLoopCorrectly() throws Exception {
        // given: JSON input from resources
        InputStream jsonStream = getClass().getResourceAsStream(
                "/4-recursive-branching-process.json");

        assertNotNull(jsonStream, "Test file not found");

        BpmnProcessDataRequestDto request = objectMapper.readValue(jsonStream,
                BpmnProcessDataRequestDto.class);

        // Perform optimization
        BpmnProcessDataResponseDto result = service.optimize(request);

        // Check that ServiceTask nodes (1 and 7) are removed
        assertFalse(result.nodes().stream().anyMatch(n -> n.getId().equals("1")),
                "ServiceTask node 1 should be removed");
        assertFalse(result.nodes().stream().anyMatch(n -> n.getId().equals("7")),
                "ServiceTask node 7 should be removed");

        // Check that Gateway nodes (3 and 6) are removed
        assertFalse(result.nodes().stream().anyMatch(n -> n.getId().equals("3")),
                "Gateway node 3 should be removed");
        assertFalse(result.nodes().stream().anyMatch(n -> n.getId().equals("6")),
                "Gateway node 6 should be removed");

        // Expected resulting edges after optimization:
        // 0 → 2 (via 1)
        // 2 → 4 (via 3)
        // 2 → 5 (via 3)
        // 4 → 8 (via 6 → 7)
        // 5 → 8 (via 6 → 7)
        // 4 → 2 (via 6)
        // 5 → 2 (via 6)
        List<EdgeImpl> expected = List.of(
                new EdgeImpl("0", "2"),
                new EdgeImpl("2", "4"),
                new EdgeImpl("2", "5"),
                new EdgeImpl("5", "8"),
                new EdgeImpl("4", "8"),
                new EdgeImpl("5", "2"),
                new EdgeImpl("4", "2")
        );

        assertEquals(expected.size(), result.edges().size(), "Edge count mismatch");

        for (EdgeImpl edge : expected) {
            assertTrue(result.edges().contains(edge), "Expected edge not found: " + edge);
        }
    }

    @Test
    void shouldThrowExceptionIfEdgeHasUnknownNode() throws JsonProcessingException {
        // given
        var invalidJson = """
                    {
                      "nodes": [
                        {"id": "1", "name": "A", "type": "START"},
                        {"id": "2", "name": "B", "type": "END"}
                      ],
                      "edges": [
                        {"from": "1", "to": "99"}
                      ]
                    }
                """;

        var dto = objectMapper.readValue(invalidJson, BpmnProcessDataRequestDto.class);

        // expect
        assertThatThrownBy(() -> service.optimize(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Edge references unknown node");
    }

    @Test
    void shouldThrowIfMultipleStartOrEndNodes() throws JsonProcessingException {
        // given
        var invalidJson = """
                    {
                      "nodes": [
                        {"id": "1", "name": "Start1", "type": "START"},
                        {"id": "2", "name": "Start2", "type": "START"},
                        {"id": "3", "name": "End", "type": "END"}
                      ],
                      "edges": []
                    }
                """;

        var dto = objectMapper.readValue(invalidJson, BpmnProcessDataRequestDto.class);

        // expect
        assertThatThrownBy(() -> service.optimize(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("exactly one Start");
    }

    private BpmnProcessDataRequestDto readJson(String path) throws IOException {
        try (var is = getClass().getResourceAsStream(path)) {
            return objectMapper.readValue(is, BpmnProcessDataRequestDto.class);
        }
    }
}

