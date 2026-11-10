// Generated from public/live-deployment-calculator.html. Do not edit.
// Source SHA-256: 793586df2cac87d548e64348f6d7de68e66f76c3a65db478de95e4e0f5cec497
const M = [
        [
          "Qwen3 8B",
          8.2,
          73728,
          131072,
          ["Q4", 4],
          ["Q8", 8],
          ["FP16", 16],
        ],
        [
          "Llama 3.2 3B Instruct",
          3.21,
          57344,
          131072,
          ["Q4", 4],
          ["Q8", 8],
          ["FP16", 16],
        ],
        [
          "Qwen3 14B",
          14.8,
          81920,
          131072,
          ["Q4", 4],
          ["Q8", 8],
          ["FP16", 16],
        ],
        ["Mixtral 8x7B Instruct", 46.7, 65536, 32768, ["Q4", 4], ["Q8", 8]],
        [
          "Llama 3.1 70B Instruct",
          70.6,
          163840,
          131072,
          ["Q4", 4],
          ["Q8", 8],
          ["FP16", 16],
        ],
        ["Qwen3.5 9B", 9, 16384, 262144, ["Q4", 4], ["Q8", 8], ["FP16", 16]],
        [
          "Gemma 4 12B IT",
          11.95,
          98304,
          262144,
          ["Q4", 4],
          ["Q8", 8],
          ["BF16", 16],
        ],
        [
          "Gemma 4 26B A4B IT",
          25.2,
          98304,
          262144,
          ["Q4", 4],
          ["Q8", 8],
          ["BF16", 16],
        ],
        [
          "Gemma 4 26B A4B IT · AI Fusion 2.0",
          25.2,
          67584,
          262144,
          ["Q4", 4],
          ["Q8", 8],
          ["BF16", 16],
        ],
        ["Phi-4 14B", 14, 98304, 16384, ["Q4", 4], ["Q8", 8], ["FP16", 16]],
        ["gpt-oss-20b", 21, 98304, 131072, ["MXFP4", 4], ["BF16", 16]],
        [
          "Mistral Small 3.1 24B Instruct",
          24,
          98304,
          131072,
          ["Q4", 4],
          ["Q8", 8],
          ["BF16", 16],
        ],
        ["Qwen3.8 27B", 27, 32768, 262144, ["Q4", 4], ["Q8", 8], ["FP16", 16]],
        [
          "Gemma 4 31B IT",
          30.7,
          98304,
          262144,
          ["Q4", 4],
          ["Q8", 8],
          ["BF16", 16],
        ],
        [
          "MiniMax H3 33B",
          33,
          Number.NaN,
          8192,
          ["Q4", 4],
          ["FP8", 8],
          ["BF16", 16],
        ],
        [
          "Qwen3.6 35B A3B",
          35,
          131072,
          262144,
          ["Q4", 4],
          ["Q8", 8],
          ["FP16", 16],
        ],
        [
          "Qwen3.6 35B A3B · AI Fusion 2.0",
          35,
          90112,
          262144,
          ["Q4", 4],
          ["Q8", 8],
          ["FP16", 16],
        ],
        [
          "Ornith 1.5 35B A3B",
          35,
          131072,
          262144,
          ["Q4", 4],
          ["Q8", 8],
          ["FP16", 16],
        ],
        [
          "Ornith 1.5 35B A3B · AI Fusion 2.0",
          35,
          90112,
          262144,
          ["Q4", 4],
          ["Q8", 8],
          ["FP16", 16],
        ],
        [
          "Llama 4 Scout 17B-16E",
          109,
          163840,
          10000000,
          ["Q4", 4],
          ["Q8", 8],
          ["BF16", 16],
        ],
        ["gpt-oss-120b", 117, 98304, 131072, ["MXFP4", 4], ["BF16", 16]],
        ["Qwen3.8 Flash Next", 125, 98304, 262144, ["Q4", 4], ["Q8", 8], ["FP16", 16]],
      ];
const H = [
        ["ThinkCentre X Tower · RTX 5060 Ti 16GB", 16, 14, [448, 759, "FP4 Tensor Core vendor peak", 180], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/"],
        ["ThinkCentre X Tower · 双 RTX 5060 Ti 16GB", 32, 20, [448, 759, "FP4 Tensor Core vendor peak", 180], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/"],
        ["ThinkCentre X Tower · RTX 5080 16GB", 16, 18, [960, 1801, "FP4 Tensor Core vendor peak", 360], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/"],
        ["ThinkCentre X Tower · RTX 5090 32GB", 32, 27, [1792, 3352, "FP4 Tensor Core vendor peak", 575], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/"],
        ["ThinkCentre X Tower · RTX PRO 5000 48GB", 48, 28, [1344, 2064, "FP4 Tensor Core vendor peak", 300], "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/"],
        ["ThinkCentre X Tower · 双 RTX PRO 5000 48GB", 96, 42, [1344, 2064, "FP4 Tensor Core vendor peak", 300], "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/"],
        ["ThinkCentre X Tower · RTX PRO 5000 72GB", 72, 35, [1344, 2064, "FP4 Tensor Core vendor peak", 300], "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/"],
        ["ThinkCentre X Tower · 双 RTX PRO 5000 72GB", 144, 55, [1344, 2064, "FP4 Tensor Core vendor peak", 300], "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/"],
        ["ThinkCentre X Ultra · 总计 128GB，可分配 96GB 给 GPU", 96, 20, [273, 55, "NPU TOPS", null]],
        ["TSK-C4 · RTX 5060 Ti 16GB", 16, 14, [448, 759, "FP4 Tensor Core vendor peak", 180], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/"],
        ["TSK-C4 · Radeon RX 9060 XT 16GB", 16, null, [320, 205, "INT8 matrix vendor peak", 160], "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9060xt.html"],
        ["ThinkCentre X Tower Gen2 · RTX 5060 Ti 16GB", 16, 14, [448, 759, "FP4 Tensor Core vendor peak", 180], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/"],
        ["ThinkCentre X Tower Gen2 · 双 RTX 5060 Ti 16GB", 32, 20, [448, 759, "FP4 Tensor Core vendor peak", 180], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/"],
        ["ThinkCentre X Tower Gen2 · RTX 5080 16GB", 16, 18, [960, 1801, "FP4 Tensor Core vendor peak", 360], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/"],
        ["ThinkCentre X Tower Gen2 · RTX 5090 32GB", 32, 27, [1792, 3352, "FP4 Tensor Core vendor peak", 575], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/"],
        ["ThinkCentre X Tower Gen2 · RTX PRO 5000 48GB", 48, 28, [1344, 2064, "FP4 Tensor Core vendor peak", 300], "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/"],
        ["ThinkCentre X Tower Gen2 · 双 RTX PRO 5000 48GB", 96, 42, [1344, 2064, "FP4 Tensor Core vendor peak", 300], "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/"],
        ["ThinkCentre X Tower Gen2 · RTX PRO 5000 72GB", 72, 35, [1344, 2064, "FP4 Tensor Core vendor peak", 300], "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/"],
        ["ThinkCentre X Tower Gen2 · 双 RTX PRO 5000 72GB", 144, 55, [1344, 2064, "FP4 Tensor Core vendor peak", 300], "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/"],
        ["M90a Pro Gen7（AIO） · Radeon RX 9060 XT 16GB", 16, null, [320, 205, "INT8 matrix vendor peak", 160], "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9060xt.html"],
        ["M90ts Gen7 · RTX 5060 Ti 16GB", 16, 14, [448, 759, "FP4 Tensor Core vendor peak", 180], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/"],
        ["M90ts Gen7 · Radeon RX 9060 XT 16GB", 16, null, [320, 205, "INT8 matrix vendor peak", 160], "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9060xt.html"],
        ["M90q Gen7 · RTX 5060 Ti 16GB", 16, 14, [448, 759, "FP4 Tensor Core vendor peak", 180], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/"],
        ["M90q Gen7 · Radeon RX 9060 XT 16GB", 16, null, [320, 205, "INT8 matrix vendor peak", 160], "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9060xt.html"],
        ["TSK-C5 · RTX 5060 Ti 16GB", 16, 14, [448, 759, "FP4 Tensor Core vendor peak", 180], "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/"],
        ["TSK-C5 · Radeon RX 9060 XT 16GB", 16, null, [320, 205, "INT8 matrix vendor peak", 160], "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9060xt.html"],
      ];
const P = [
        ["1 × ThinkCentre X Tower · RTX 5060 Ti 16GB", 16, 14, 1, 1, "单机单卡", null, null, null, "Gemma 4 26B 与 35B A3B 实测 60–70 Token/秒；其他模型性能资料待压测"],
        ["1 × ThinkCentre X Tower · 双 RTX 5060 Ti 16GB", 32, 20, 1, 2, "单机双卡分片", null, null, null, "双卡分片与性能资料待压测"],
        ["2 × ThinkCentre X Tower · 各 1 × RTX 5060 Ti 16GB", 32, 16, 2, 2, "跨设备分片，需验证运行时", null, null, null, "需验证多机互联、网络与分布式运行时"],
        ["1 × ThinkCentre X Tower · RTX 5080 16GB", 16, 18, 1, 1, "单机单卡", null, null, null, "性能资料待压测"],
        ["1 × ThinkCentre X Tower · RTX 5090 32GB", 32, 27, 1, 1, "单机单卡", null, null, null, "性能资料待压测"],
        ["1 × ThinkCentre X Tower · RTX PRO 5000 48GB", 48, 28, 1, 1, "单机单卡", null, null, null, "性能资料待压测"],
        ["1 × ThinkCentre X Tower · 双 RTX PRO 5000 48GB", 96, 42, 1, 2, "单机双卡分片", null, null, null, "双卡分片与性能资料待压测"],
        ["1 × ThinkCentre X Tower · RTX PRO 5000 72GB", 72, 35, 1, 1, "单机单卡", null, null, null, "性能资料待压测"],
        ["1 × ThinkCentre X Tower · 双 RTX PRO 5000 72GB", 144, 55, 1, 2, "单机双卡分片", null, null, null, "双卡分片与性能资料待压测"],
        ["1 × ThinkCentre X Ultra · 总计 128GB，可分配 96GB 给 GPU", 96, 20, 1, 1, "统一内存", null, null, null, "统一内存分配与性能资料待压测"],
        ["1 × TSK-C4 · RTX 5060 Ti 16GB", 16, 14, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测 60–70 Token/秒"],
        ["1 × TSK-C4 · Radeon RX 9060 XT 16GB", 16, null, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测约 50 Token/秒"],
        ["1 × ThinkCentre X Tower Gen2 · RTX 5060 Ti 16GB", 16, 14, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测 60–70 Token/秒"],
        ["1 × ThinkCentre X Tower Gen2 · 双 RTX 5060 Ti 16GB", 32, 20, 1, 2, "单机双卡分片", null, null, null, "支持 AI Fusion 2.0；双卡分片与性能资料待压测"],
        ["1 × ThinkCentre X Tower Gen2 · RTX 5080 16GB", 16, 18, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；性能资料待压测"],
        ["1 × ThinkCentre X Tower Gen2 · RTX 5090 32GB", 32, 27, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；性能资料待压测"],
        ["1 × ThinkCentre X Tower Gen2 · RTX PRO 5000 48GB", 48, 28, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；性能资料待压测"],
        ["1 × ThinkCentre X Tower Gen2 · 双 RTX PRO 5000 48GB", 96, 42, 1, 2, "单机双卡分片", null, null, null, "支持 AI Fusion 2.0；双卡分片与性能资料待压测"],
        ["1 × ThinkCentre X Tower Gen2 · RTX PRO 5000 72GB", 72, 35, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；性能资料待压测"],
        ["1 × ThinkCentre X Tower Gen2 · 双 RTX PRO 5000 72GB", 144, 55, 1, 2, "单机双卡分片", null, null, null, "支持 AI Fusion 2.0；双卡分片与性能资料待压测"],
        ["1 × M90a Pro Gen7（AIO） · Radeon RX 9060 XT 16GB", 16, null, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测约 50 Token/秒"],
        ["1 × M90ts Gen7 · RTX 5060 Ti 16GB", 16, 14, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测 60–70 Token/秒"],
        ["1 × M90ts Gen7 · Radeon RX 9060 XT 16GB", 16, null, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测约 50 Token/秒"],
        ["1 × M90q Gen7 · RTX 5060 Ti 16GB", 16, 14, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测 60–70 Token/秒"],
        ["1 × M90q Gen7 · Radeon RX 9060 XT 16GB", 16, null, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测约 50 Token/秒"],
        ["1 × TSK-C5 · RTX 5060 Ti 16GB", 16, 14, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测 60–70 Token/秒"],
        ["1 × TSK-C5 · Radeon RX 9060 XT 16GB", 16, null, 1, 1, "单机单卡", null, null, null, "支持 AI Fusion 2.0；Gemma 4 26B 与 35B A3B 实测约 50 Token/秒"],
      ];
export const deviceAdditions = {"schemaVersion":1,"lastUpdated":"2026-11-10","source":{"label":"Owner-confirmed device matching rules","methodology":"Use the single-card ThinkCentre X Tower RTX 5060 Ti 16GB capacity and model matching rules, including AI Fusion 2.0. GPU chip specifications are inherited from the same GPU. No device benchmark or directional speed is asserted."},"devices":[{"id":"thinkcentre-neo50t-gen7-5060ti-16gb","name":"ThinkCentre neo50t Gen7 · RTX 5060 Ti 16GB","referenceDevice":"ThinkCentre X Tower · RTX 5060 Ti 16GB","aiFusion2":true,"lastUpdated":"2026-11-10"},{"id":"yangtian-t490ins-5060ti-16gb","name":"YangTian T490INS · RTX 5060 Ti 16GB","referenceDevice":"ThinkCentre X Tower · RTX 5060 Ti 16GB","aiFusion2":true,"lastUpdated":"2026-11-10"}]};
for (const device of deviceAdditions.devices) {
  const reference = H.find(h => h[0] === device.referenceDevice);
  const referencePlan = P.find(p => p[0] === "1 × " + device.referenceDevice && p[3] === 1);
  H.push([device.name, reference[1], null, [...reference[3]], reference[4]]);
  P.push(["1 × " + device.name, referencePlan[1], null, 1, referencePlan[4], referencePlan[5], null, null, null, device.aiFusion2 ? "支持 AI Fusion 2.0" : ""]);
}
function isMeasuredModel(name) {
        const value = String(name);
        return value.indexOf("Gemma 4 26B") >= 0 || value.indexOf("35B A3B") >= 0;
      }
function measuredChatSpeed(deviceName, modelName) {
        if (modelName && !isMeasuredModel(modelName)) return null;
        const name = String(deviceName);
        if (name.indexOf("双") >= 0 || name.indexOf("各 1") >= 0) return null;
        if (name.indexOf("5060 Ti") >= 0) return { low: 60, high: 70, text: "60–70" };
        if (name.indexOf("9060 XT") >= 0) return { low: 50, high: 50, text: "50" };
        return null;
      }
function matchesCapability(name, capability) {
        if (capability === "all") return true;
        const value = name.toLowerCase();
        const labels = {
          reasoning: /deepseek|qwen3|r1|ornith/.test(value),
          coding: /coder|code|qwen3|ornith/.test(value),
          multimodal: /qwen3\.5|qwen3\.8|gemma 4|llama 4|minimax/.test(value),
          document: /qwen|llama|mistral|gemma|deepseek|ornith/.test(value),
          translation: /qwen|llama|mistral|gemma|ornith/.test(value),
          text: !/qwen3\.5|qwen3\.8|gemma 4|llama 4|minimax/.test(value)
        };
        return !!labels[capability];
      }
function isAiFusion2(m) {
        return String(m[0]).indexOf("AI Fusion 2.0") >= 0;
      }
function canPostTrain(m, tier) {
        if (!tier || isAiFusion2(m)) return false;
        const size = m[1];
        // 14B-class includes records slightly over 14B, e.g. Qwen3 14B = 14.8B.
        if (tier === 320) return size <= 15;
        if (tier === 1024) return size <= 72;
        return false;
      }
function fusionOffloadGB(m) {
        return isAiFusion2(m) ? 5 : 0;
      }
function fusionSsdKvGB(m) {
        return isAiFusion2(m) ? 1 : 0;
      }
function fusionUtilization(m, fallback) {
        return isAiFusion2(m) ? 0.95 : fallback;
      }
export const catalog = { M, H, P };
export const packManifest = {"schemaVersion":1,"dataVersion":"2026.09-sample.15","lastUpdated":"2026-09-22","catalogs":{"models":"models.json","modelBenchmarks":"model-benchmarks.json","gpus":"gpus.json","inferenceProfiles":"inference-profiles.json","cloudPricing":"cloud-pricing.json","assumptions":"assumptions.json","presets":"presets.json","systems":"systems.json","exchangeRates":"exchange-rates.json"}};
export { measuredChatSpeed, matchesCapability, isAiFusion2, canPostTrain };

export function calculateModelMemory(m, bits, contextK, con, utilizationPercent) {
  const ctx = contextK * 1024;
  const userVramUtilization = Math.min(99, Math.max(50, (+utilizationPercent || 90))) / 100;
  const vramUtilization = fusionUtilization(m, userVramUtilization),
          weight = ((m[1] * bits) / 8) * 1.04,
          offload = fusionOffloadGB(m),
          gpuWeight = Math.max(0, weight - offload),
          kvKnown = Number.isFinite(m[2]),
          totalKv = kvKnown ? (m[2] * ctx * con) / 1024 / 1024 / 1024 : null,
          ssdKv = kvKnown ? Math.min(fusionSsdKvGB(m), totalKv) : 0,
          kv = kvKnown ? totalKv - ssdKv : null,
          need = kvKnown ? Math.ceil((gpuWeight + kv) / vramUtilization) : null,
          safetyReserve = kvKnown ? need - gpuWeight - kv : null;
  return { m, weight: gpuWeight, offload, ssdKv, kv, kvKnown, util: vramUtilization, need, reserve: safetyReserve };
}

export function calculateHardwareMemory(m, bits, contextK, con) {
  const ctx = contextK * 1024, vramUtilization = 0.9;

          const totalWeight = m[1] * bits / 8 * 1.04;
          const offload = fusionOffloadGB(m);
          const weight = Math.max(0, totalWeight - offload);
          const kvKnown = Number.isFinite(m[2]);
          const totalKv = kvKnown ? m[2] * ctx * con / 1024 / 1024 / 1024 : null;
          const ssdKv = kvKnown ? Math.min(fusionSsdKvGB(m), totalKv) : 0;
          const kv = kvKnown ? totalKv - ssdKv : null;
          const util = fusionUtilization(m, vramUtilization);
          return { m, weight, offload, ssdKv, kv, kvKnown, util, need: kvKnown ? Math.ceil((weight + kv) / util) : null };
        
}

// Presentation eligibility guards; the original arithmetic above is unchanged.
export function inspectMemory(m, bits, contextK, con, utilizationPercent = 90) {
  const result = calculateModelMemory(m, bits, contextK, con, utilizationPercent);
  return { w: result.weight, kv: result.kv, off: result.offload, ssd: result.ssdKv, util: result.util, need: result.need, reserve: result.reserve, supported: m.slice(4).some(q => q[1] === bits), contextOK: contextK * 1024 <= m[3] };
}
export function capacityFor(deviceIndex, count, sharding) {
  const h = H[deviceIndex];
  return sharding ? h[1] * Math.max(1, count || 1) : h[1];
}
export function modelPlans(need) {
  return need === null ? [] : P.filter(h => h[1] >= need);
}
