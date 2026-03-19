import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function EmailConfirmPage() {
  usePageTitle('Email подтверждён');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="w-full max-w-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <MailCheck className="h-8 w-8 text-primary" />
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Email подтверждён!
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Ваш адрес электронной почты успешно подтверждён.<br />
          Вернитесь и войдите в аккаунт.
        </p>

        <Button asChild className="w-full">
          <Link to="/auth/login">Войти в аккаунт</Link>
        </Button>
      </motion.div>
    </div>
  );
}
