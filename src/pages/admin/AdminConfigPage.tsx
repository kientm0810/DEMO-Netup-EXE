import { useAppStore } from "../../app/providers/AppStoreProvider";
import { useState } from "react";
import { AdminConfigForm } from "../../features/admin";
import { Badge, Button, Card } from "../../shared/components";

export function AdminConfigPage() {
  const {
    state,
    updateAdminConfig,
    clearCurrentTestData,
    clearAllTransactionalData,
    reloadData,
    isLoading,
    syncError,
  } = useAppStore();
  const [cleaning, setCleaning] = useState(false);
  const [hardCleaning, setHardCleaning] = useState(false);
  const [cleanMessage, setCleanMessage] = useState("");

  const handleClean = async () => {
    setCleaning(true);
    setCleanMessage("");
    const ok = await clearCurrentTestData();
    setCleanMessage(
      ok
        ? "Đã dọn dữ liệu test của phiên demo hiện tại (booking/pool/assessment/slot tự tạo)."
        : "Dọn dữ liệu test thất bại, vui lòng kiểm tra quyền RLS hoặc kết nối Supabase.",
    );
    setCleaning(false);
  };

  const handleReload = async () => {
    await reloadData();
  };

  const handleHardClean = async () => {
    setHardCleaning(true);
    setCleanMessage("");
    const ok = await clearAllTransactionalData();
    setCleanMessage(
      ok
        ? "Đã dọn toàn bộ dữ liệu giao dịch (booking/pool/assessment) và slot runtime do người chơi tạo."
        : "Dọn dữ liệu giao dịch toàn cục thất bại.",
    );
    setHardCleaning(false);
  };

  return (
    <section className="space-y-4 fade-up">
      <AdminConfigForm initialConfig={state.adminConfig} onSave={updateAdminConfig} />

      <Card className="text-sm text-slate-600">
        Cấu hình ở trang này sẽ tác động trực tiếp đến booking mới tạo (ví dụ: phí sàn và phí nền tảng
        trong phần tạm tính).
      </Card>

      <Card className="space-y-3">
        <h3 className="font-heading text-lg font-semibold text-ink">Quản trị dữ liệu test</h3>
        <p className="text-sm text-slate-600">
          Dùng các nút bên dưới để làm sạch dữ liệu phát sinh khi demo trực tiếp trên Supabase.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void handleClean()} disabled={cleaning}>
            {cleaning ? "Đang dọn..." : "Dọn dữ liệu test hiện tại"}
          </Button>
          <Button variant="outline" onClick={() => void handleHardClean()} disabled={hardCleaning}>
            {hardCleaning ? "Đang dọn toàn cục..." : "Dọn toàn bộ dữ liệu giao dịch"}
          </Button>
          <Button variant="outline" onClick={() => void handleReload()} disabled={isLoading}>
            {isLoading ? "Đang đồng bộ..." : "Làm mới dữ liệu từ DB"}
          </Button>
        </div>
        {cleanMessage ? <p className="text-sm text-slate-700">{cleanMessage}</p> : null}
        {syncError ? <Badge tone="warning">{syncError}</Badge> : null}
      </Card>
    </section>
  );
}
