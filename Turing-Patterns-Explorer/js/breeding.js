// Pattern Breeding System - Interpolate parameters between two presets
function breedPatterns(presetA, presetB, blendFactor) {
    // blendFactor: 0.0 = pure A, 0.5 = 50/50 blend, 1.0 = pure B
    const f = presetA.f * (1 - blendFactor) + presetB.f * blendFactor;
    const k = presetA.k * (1 - blendFactor) + presetB.k * blendFactor;

    return {
        name: `${presetA.name} × ${presetB.name}`,
        f: f,
        k: k,
        description: `Hybrid of ${presetA.name} and ${presetB.name}`,
        isBreed: true
    };
}
