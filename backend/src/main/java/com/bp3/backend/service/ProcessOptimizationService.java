package com.bp3.backend.service;

public interface ProcessOptimizationService<I, O> {

    O optimize(I input);

    O optimizeFile(I input);
}
