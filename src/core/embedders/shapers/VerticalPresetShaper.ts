import type { ShapingPlan } from '@denkiyagi/fontkit';
import { BasicPresetShaper } from './BasicPresetShaper.js';

/**
 * `Shaper` with [GSUB](https://learn.microsoft.com/en-us/typography/opentype/spec/gsub) features
 * commonly used for vertical texts:
 * `ccmp`, `locl`, `rclt`, `rlig` and `vert`.
 */
export class VerticalPresetShaper extends BasicPresetShaper {
  static verticalFeatures = ['vert'];

  protected override addPresetFeatures(plan: ShapingPlan): void {
    super.addPresetFeatures(plan);
    plan.add(VerticalPresetShaper.verticalFeatures);
  }
}
