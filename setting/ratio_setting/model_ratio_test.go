package ratio_setting

import "testing"

func TestCompletionRatioExplicitConfigOverridesDefaultRule(t *testing.T) {
	original := CompletionRatio2JSONString()
	t.Cleanup(func() {
		if err := UpdateCompletionRatioByJSONString(original); err != nil {
			t.Fatalf("restore completion ratio: %v", err)
		}
	})

	if err := UpdateCompletionRatioByJSONString(`{"gpt-5.5-pro":2.5}`); err != nil {
		t.Fatalf("update completion ratio: %v", err)
	}

	if got := GetCompletionRatio("gpt-5.5-pro"); got != 2.5 {
		t.Fatalf("completion ratio = %v, want 2.5", got)
	}

	info := GetCompletionRatioInfo("gpt-5.5-pro")
	if info.Ratio != 2.5 || info.Locked {
		t.Fatalf("completion ratio info = %+v, want ratio 2.5 and unlocked", info)
	}
}
