import { Link } from "react-router-dom";
import { Button, EmptyState } from "../shared/components";

export function NotFoundPage() {
  return (
    <EmptyState
      title="Không tìm thấy trang"
      description="Đường dẫn không tồn tại trong bản demo MVP."
    >
      <Link to="/">
        <Button>Về trang chủ</Button>
      </Link>
    </EmptyState>
  );
}
