import type { ReactNode } from "react";

import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

const RoleGuard = ({
  allowedRoles,
  children,
}: RoleGuardProps) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;