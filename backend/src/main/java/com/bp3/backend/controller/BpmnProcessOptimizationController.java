package com.bp3.backend.controller;

import com.bp3.backend.dto.BpmnProcessDataRequestDto;
import com.bp3.backend.dto.BpmnProcessDataResponseDto;
import com.bp3.backend.service.BpmnProcessOptimizationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/bpmn/optimize")
public class BpmnProcessOptimizationController {

    private final BpmnProcessOptimizationService bpmnService;
    private final ObjectMapper objectMapper;

    public BpmnProcessOptimizationController(
            BpmnProcessOptimizationService bpmnService,
            ObjectMapper objectMapper) {
        this.bpmnService = bpmnService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/process-json")
    public ResponseEntity<BpmnProcessDataResponseDto> optimizeFromJson(
            @Valid @RequestBody BpmnProcessDataRequestDto dto) {
        return ResponseEntity.ok(bpmnService.optimize(dto));
    }

    @PostMapping(value = "/process-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BpmnProcessDataResponseDto> optimizeFromMultipartFile(
            @RequestPart("file") MultipartFile file) {
        try {
            BpmnProcessDataRequestDto dto = objectMapper.readValue(file.getInputStream(), BpmnProcessDataRequestDto.class);
            return ResponseEntity.ok(bpmnService.optimizeFile(dto));
        } catch (IOException e) {
            throw new IllegalArgumentException("Cannot read uploaded JSON file", e);
        }
    }
}

