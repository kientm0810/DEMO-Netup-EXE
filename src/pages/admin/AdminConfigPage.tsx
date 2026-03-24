import { useAppStore } from "../../app/providers/AppStoreProvider";
import { AdminConfigForm } from "../../features/admin";
import { Card } from "../../shared/components";

export function AdminConfigPage() {
  const { state, updateAdminConfig } = useAppStore();

  return (
    <section className="space-y-4 fade-up">
      <AdminConfigForm initialConfig={state.adminConfig} onSave={updateAdminConfig} />

      <Card className="text-sm text-slate-600">
        Cấu hình ở trang này sẽ tác động trực tiếp đến booking mới tạo (ví dụ: phí sàn và phí nền tảng
        trong phần tạm tính).
      </Card>
    </section>
  );
}
