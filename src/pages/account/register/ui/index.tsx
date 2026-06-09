import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BlankLayout } from "@/widgets/layouts";
import { useAppContext, useAuth } from "@/appx/providers";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";
import { toast } from "react-toastify";
import { GoogleIcon } from "@/shared/ui/icons";
import { Button } from "@/shared/ui/ds/atoms/button";
import { Input } from "@/shared/ui/ds/atoms/input";
import type { RegisterPageConfig } from "@/shared/types/admin-config";

/* ── Figma asset: Decoration blobs (temporary remote URLs, expires ~7 days) ── */
const imgDecorationTop =
  "https://www.figma.com/api/mcp/asset/88de9b06-33d8-49c7-97f6-bbff2ac4f3df";
const imgDecorationBottom =
  "https://www.figma.com/api/mcp/asset/900d930c-56b4-49ba-8b46-326dad91858d";
const imgLogoText =
  "https://www.figma.com/api/mcp/asset/bc794042-a1f7-478d-80de-8fd94d7a7c7a";
const imgTrophy =
  "https://www.figma.com/api/mcp/asset/afda6ff4-1677-4a59-a9b0-cc04a781504d";

/* ── Icon helpers (Material Symbols Rounded via className) ── */
const EyeIcon = () => (
  <span className="material-symbols-rounded text-[#6a7282] text-[18px] leading-none select-none">
    visibility
  </span>
);
const EyeOffIcon = () => (
  <span className="material-symbols-rounded text-[#6a7282] text-[18px] leading-none select-none">
    visibility_off
  </span>
);
const UserIcon = () => (
  <span className="material-symbols-rounded text-[#6a7282] text-[18px] leading-none select-none">
    person
  </span>
);
const EnvelopeIcon = () => (
  <span className="material-symbols-rounded text-[#6a7282] text-[18px] leading-none select-none">
    mail
  </span>
);
const LockIcon = () => (
  <span className="material-symbols-rounded text-[#6a7282] text-[18px] leading-none select-none">
    lock
  </span>
);

const FEATURES = [
  "920+ real mock tests, free to start",
  "Instant band scores & analytics",
  "Feedback from expert teachers",
  "A study plan built around your goal",
];

const BAND_OPTIONS = ["Band 6.5", "Band 7.0", "Band 7.5", "Band 8.0"];

type FormData = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};

interface PageRegisterProps {
  registerConfig?: RegisterPageConfig;
}

export function PageRegister({ registerConfig: _registerConfig }: PageRegisterProps) {
  const { masterData: _masterData } = useAppContext();
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<FormData>();

  const passwordValue = watch("password");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedBand, setSelectedBand] = useState("Band 7.5");

  const onSubmit = async (data: FormData) => {
    try {
      await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success("Tạo tài khoản thành công!");
      // signUp already creates the auth session, just sign in to set cookie & redirect
      await signIn({ email: data.email, password: data.password });
    } catch (err: any) {
      const message = err?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setError("email", {
        type: "manual",
        message,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    /* === SECTION: Page Root === */
    <div
      className="flex flex-col min-h-screen bg-[#f6f7f4]"
      data-section="auth-register-root"
    >
      {/* === SECTION: Body (Brand Panel + Form Area) === */}
      <div
        className="flex flex-1 min-h-screen"
        data-section="auth-register-body"
      >
        {/* === SECTION: Brand Panel (dark) === */}
        <div
          className="hidden md:flex flex-1 flex-col justify-between px-[60px] lg:px-[120px] py-[100px] bg-[#191d24] relative overflow-hidden"
          data-section="brand-panel"
        >
          {/* Decoration blobs */}
          <img
            src={imgDecorationTop}
            alt=""
            aria-hidden="true"
            className="absolute right-[-40px] top-[-104px] w-[320px] h-[320px] pointer-events-none"
          />
          <img
            src={imgDecorationBottom}
            alt=""
            aria-hidden="true"
            className="absolute left-[-157px] bottom-[-60px] w-[401px] h-[401px] pointer-events-none"
          />

          {/* Logo */}
          <div className="relative z-10 h-[50px]">
            <img
              src={imgLogoText}
              alt="VitIELTS"
              className="h-[50px] w-auto"
            />
          </div>

          {/* Headline + feature bullets */}
          <div className="relative z-10 flex flex-col gap-[26px]">
            <h1 className="font-display font-bold text-[46px] leading-[1.08] tracking-[-0.92px] text-white w-[470px]">
              Start your<br />
              Band 8.0 journey.
            </h1>

            {FEATURES.map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                {/* Check icon pill */}
                <span className="flex items-center justify-center shrink-0 w-[26px] h-[26px] rounded-[13px] bg-[#b3e653]">
                  <span className="material-symbols-rounded text-[#191d24] text-[14px] leading-none font-bold select-none">
                    check
                  </span>
                </span>
                <p className="font-inter font-medium text-[16px] text-[#dbe0e8]">
                  {feat}
                </p>
              </div>
            ))}
          </div>

          {/* Card · Band 7.5 */}
          <div
            className="relative z-10 flex items-center gap-4 bg-white rounded-[20px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.1)] px-5 h-[92px] w-[330px]"
            data-section="band-card"
          >
            <img
              src={imgTrophy}
              alt=""
              aria-hidden="true"
              className="w-[34px] h-[34px] shrink-0"
            />
            <div className="flex flex-col gap-[2px]">
              <p className="font-inter font-bold text-[15px] text-[#191d24] whitespace-nowrap">
                Band 7.5 — last mock
              </p>
              <p className="font-inter font-normal text-[13px] text-[#6a7282] whitespace-nowrap">
                +1.5 since you started
              </p>
            </div>
          </div>
        </div>

        {/* === SECTION: Form Area === */}
        <div
          className="flex flex-1 items-center justify-center px-4 py-12 bg-[#f6f7f4]"
          data-section="form-area"
        >
          {/* Card · Auth Form */}
          <div
            className="bg-white rounded-[28px] shadow-[0px_16px_40px_0px_rgba(0,0,0,0.08)] p-[40px] w-full max-w-[460px] flex flex-col gap-4"
            data-section="auth-card"
          >
            {/* Title + subtitle */}
            <h2 className="font-display font-bold text-[30px] leading-[1.08] tracking-[-0.6px] text-[#9ad534]">
              Create account
            </h2>
            <p className="font-inter font-normal text-[15px] text-[#6a7282]">
              Free forever. No card required.
            </p>

            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* === Full name === */}
              <div className="flex flex-col gap-[6px]">
                <label
                  htmlFor="register-name"
                  className="font-inter font-semibold text-[13px] text-[#191d24]"
                >
                  Full name
                </label>
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="register-name"
                      type="text"
                      size="lg"
                      placeholder="Your name"
                      leftIcon={<UserIcon />}
                      error={!!errors.name}
                      fullWidth
                    />
                  )}
                />
                {errors.name && (
                  <span className="font-inter text-[12px] text-[#e54552]">
                    Vui lòng nhập họ và tên
                  </span>
                )}
              </div>

              {/* === Email === */}
              <div className="flex flex-col gap-[6px]">
                <label
                  htmlFor="register-email"
                  className="font-inter font-semibold text-[13px] text-[#191d24]"
                >
                  Email
                </label>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: { value: true, message: "Email is required" },
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email không hợp lệ",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="register-email"
                      type="text"
                      size="lg"
                      placeholder="you@email.com"
                      leftIcon={<EnvelopeIcon />}
                      error={!!errors.email}
                      fullWidth
                    />
                  )}
                />
                {errors.email && (
                  <span className="font-inter text-[12px] text-[#e54552]">
                    {errors.email.message || "Vui lòng nhập email"}
                  </span>
                )}
              </div>

              {/* === Password === */}
              <div className="flex flex-col gap-[6px]">
                <label
                  htmlFor="register-password"
                  className="font-inter font-semibold text-[13px] text-[#191d24]"
                >
                  Password
                </label>
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      size="lg"
                      placeholder="Create a password"
                      leftIcon={<LockIcon />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="flex items-center justify-center p-0 bg-transparent border-none cursor-pointer leading-none"
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      }
                      error={!!errors.password}
                      fullWidth
                    />
                  )}
                />
                {errors.password && (
                  <span className="font-inter text-[12px] text-[#e54552]">
                    Vui lòng nhập mật khẩu
                  </span>
                )}
              </div>

              {/* === Confirm Password === */}
              <div className="flex flex-col gap-[6px]">
                <label
                  htmlFor="register-confirm-password"
                  className="font-inter font-semibold text-[13px] text-[#191d24]"
                >
                  Confirm password
                </label>
                <Controller
                  control={control}
                  name="confirm_password"
                  rules={{
                    required: "Vui lòng nhập lại mật khẩu",
                    validate: (value) =>
                      value === passwordValue || "Mật khẩu không khớp",
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      size="lg"
                      placeholder="Repeat your password"
                      leftIcon={<LockIcon />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="flex items-center justify-center p-0 bg-transparent border-none cursor-pointer leading-none"
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      }
                      error={!!errors.confirm_password}
                      fullWidth
                    />
                  )}
                />
                {errors.confirm_password && (
                  <span className="font-inter text-[12px] text-[#e54552]">
                    {errors.confirm_password.message}
                  </span>
                )}
              </div>

              {/* === Target band (decorative UI toggle, no backend impact) === */}
              <div className="flex flex-col gap-[10px]">
                <label className="font-inter font-semibold text-[13px] text-[#191d24]">
                  Target band
                </label>
                <div className="flex items-center justify-between gap-2">
                  {BAND_OPTIONS.map((band) => {
                    const isSelected = selectedBand === band;
                    return (
                      <button
                        key={band}
                        type="button"
                        onClick={() => setSelectedBand(band)}
                        className={[
                          "flex-1 h-[38px] flex items-center justify-center rounded-[100px]",
                          "font-inter font-bold text-[13px] text-[#191d24]",
                          "transition-colors cursor-pointer border",
                          isSelected
                            ? "bg-[#b3e653] border-[#b3e653]"
                            : "bg-white border-[rgba(25,29,36,0.1)] hover:border-[rgba(25,29,36,0.2)]",
                        ].join(" ")}
                      >
                        {band}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* === Submit === */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                loading={isSubmitting || isLoading}
                disabled={isSubmitting || isLoading}
              >
                Create account
              </Button>
            </form>

            {/* === Google button === */}
            <Button
              type="button"
              variant="outlined"
              size="md"
              fullWidth
              disabled={isLoading || isSubmitting}
              onClick={handleGoogleLogin}
              leftIcon={<GoogleIcon />}
            >
              Continue with Google
            </Button>

            {/* === Login link === */}
            <div className="flex gap-[5px] items-center text-[14px]">
              <span className="font-inter font-normal text-[#6a7282]">
                Already have an account?
              </span>
              <Link
                href={ROUTES.LOGIN()}
                className="font-inter font-bold text-[#9ad534] hover:underline"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* === SECTION: Footer === */}
      <footer
        className="bg-[#191d24] flex items-start justify-between px-[90px] py-[48px] shrink-0 w-full"
        data-section="auth-footer"
      >
        <div className="flex flex-col gap-[14px]">
          <div className="flex items-center font-display font-bold text-[19px] leading-[1.3]">
            <span className="text-white">VIT</span>
            <span className="text-[#9ad534]">IELTS</span>
          </div>
          <p className="font-inter font-normal text-[14px] leading-[1.4] text-[#6a7282] w-[280px]">
            Smarter IELTS preparation for ambitious learners. Practice, track,
            improve — all in one place.
          </p>
        </div>
        <div className="flex flex-col gap-[10px]">
          <p className="font-inter font-bold text-[12px] tracking-[0.96px] text-white">
            LEARN
          </p>
          <div className="h-1" />
          {["Listening", "Reading", "Writing", "Speaking"].map((item) => (
            <p
              key={item}
              className="font-inter font-normal text-[14px] leading-[1.4] text-[#6a7282]"
            >
              {item}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-[10px]">
          <p className="font-inter font-bold text-[12px] tracking-[0.96px] text-white">
            RESOURCES
          </p>
          <div className="h-1" />
          {["Mock tests", "Vocabulary", "Blog", "Band guide"].map((item) => (
            <p
              key={item}
              className="font-inter font-normal text-[14px] leading-[1.4] text-[#6a7282]"
            >
              {item}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-[10px]">
          <p className="font-inter font-bold text-[12px] tracking-[0.96px] text-white">
            COMPANY
          </p>
          <div className="h-1" />
          {["About", "Teachers", "Pricing", "Contact"].map((item) => (
            <p
              key={item}
              className="font-inter font-normal text-[14px] leading-[1.4] text-[#6a7282]"
            >
              {item}
            </p>
          ))}
        </div>
      </footer>
    </div>
  );
}

PageRegister.Layout = BlankLayout;
