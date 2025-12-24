import type { ShapingPlan } from '@denkiyagi/fontkit';
import { BasicPresetShaper } from './BasicPresetShaper.js';

/**
 * `Shaper` with [GSUB](https://learn.microsoft.com/en-us/typography/opentype/spec/gsub) features
 * commonly used for horizontal texts:
 * `ccmp`, `locl`, `rclt`, `rlig`, `calt`, `clig`, `liga`.
 */
export class HorizontalPresetShaper extends BasicPresetShaper {
  static horizontalFeatures = ['calt', 'clig', 'liga'];

  protected override addPresetFeatures(plan: ShapingPlan): void {
    super.addPresetFeatures(plan);
    plan.add(HorizontalPresetShaper.horizontalFeatures);
  }
}
