import { useState, type FormEvent } from "react";
import type { AdminConfig } from "../../entities";
import { Badge, Button, Card, Input } from "../../shared/components";

interface AdminConfigFormProps {
  initialConfig: AdminConfig;
  onSave: (nextConfig: AdminConfig) => void;
}

export function AdminConfigForm({ initialConfig, onSave }: AdminConfigFormProps) {
  const [config, setConfig] = useState<AdminConfig>(initialConfig);
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(config);
    setSaved(true);
  };

  return (
    <Card>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <Input
          label="Tỷ lệ phí nền tảng (0-1)"
          type="number"
          min={0}
          max={1}
          step="0.01"
          value={config.platformFeeRate}
          onChange={(event) =>
            setConfig((prev) => ({ ...prev, platformFeeRate: Number(event.target.value) || 0 }))
          }
        />
        <Input
          label="Phí sàn (VND)"
          type="number"
          min={0}
          step="500"
          value={config.floorFeeVnd}
          onChange={(event) =>
            setConfig((prev) => ({ ...prev, floorFeeVnd: Number(event.target.value) || 0 }))
          }
        />
        <Input
          label="Bán kính ghép kèo (km)"
          type="number"
          min={1}
          max={20}
          value={config.matchingRadiusKm}
          onChange={(event) =>
            setConfig((prev) => ({ ...prev, matchingRadiusKm: Number(event.target.value) || 1 }))
          }
        />
        <Input
          label="Giới hạn no-show"
          type="number"
          min={1}
          max={10}
          value={config.noShowStrikeLimit}
          onChange={(event) =>
            setConfig((prev) => ({ ...prev, noShowStrikeLimit: Number(event.target.value) || 1 }))
          }
        />
        <Input
          label="Tự nhả slot (phút)"
          type="number"
          min={5}
          step={5}
          value={config.autoReleaseMinutes}
          onChange={(event) =>
            setConfig((prev) => ({ ...prev, autoReleaseMinutes: Number(event.target.value) || 5 }))
          }
        />
        <Input
          label="Tỷ lệ đặt cọc (%)"
          type="number"
          min={0}
          max={100}
          value={config.depositPercent}
          onChange={(event) =>
            setConfig((prev) => ({ ...prev, depositPercent: Number(event.target.value) || 0 }))
          }
        />

        <label className="sm:col-span-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-ink"
            checked={config.supportHotlineEnabled}
            onChange={(event) =>
              setConfig((prev) => ({ ...prev, supportHotlineEnabled: event.target.checked }))
            }
          />
          Bật hotline hỗ trợ dự phòng
        </label>

        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit">Lưu cấu hình</Button>
          {saved ? <Badge tone="success">Đã lưu vào mock state</Badge> : null}
        </div>
      </form>
    </Card>
  );
}
