import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

/**
 * App-level error boundary. Catches client-side render errors that would
 * otherwise show Next.js's blank "Application error: a client-side
 * exception has occurred" page, and posts the stack trace to
 * `/api/log-client-error` so it surfaces in Vercel runtime logs.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error?.message };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Best-effort: never block the fallback UI on logging failures.
        try {
            void fetch("/api/log-client-error", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: error?.message,
                    stack: error?.stack,
                    componentStack: info?.componentStack,
                    url: typeof window !== "undefined" ? window.location.href : undefined,
                    userAgent:
                        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
                }),
                keepalive: true,
            }).catch(() => undefined);
        } catch {
            // swallow
        }
        // Also surface in the browser console for anyone who happens to
        // have devtools open.
        // eslint-disable-next-line no-console
        console.error("[AppErrorBoundary]", error, info);
    }

    private handleReload = () => {
        if (typeof window !== "undefined") window.location.reload();
    };

    private handleHome = () => {
        if (typeof window !== "undefined") window.location.href = "/";
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    fontFamily: "inherit",
                    color: "#2D3142",
                    background: "#f8f9fb",
                }}
            >
                <div
                    style={{
                        maxWidth: 520,
                        width: "100%",
                        background: "#fff",
                        borderRadius: 16,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        padding: "32px 28px",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: 56, marginBottom: 12 }}>⚠️</div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                        Đã xảy ra lỗi
                    </h1>
                    <p
                        style={{
                            color: "#6A7282",
                            marginTop: 12,
                            marginBottom: 0,
                            lineHeight: 1.55,
                        }}
                    >
                        Trang gặp lỗi không mong muốn. Bài làm của bạn (nếu đang làm
                        bài) đã được tự động lưu nháp 60 giây/lần. Hãy thử tải lại trang
                        — nếu vẫn lỗi, vui lòng liên hệ hỗ trợ.
                    </p>
                    {this.state.message && (
                        <pre
                            style={{
                                marginTop: 16,
                                padding: "10px 12px",
                                background: "#f3f4f6",
                                borderRadius: 8,
                                color: "#6A7282",
                                fontSize: 12,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                textAlign: "left",
                            }}
                        >
                            {this.state.message}
                        </pre>
                    )}
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "center",
                            marginTop: 20,
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            type="button"
                            onClick={this.handleReload}
                            style={{
                                padding: "10px 20px",
                                background: "#D94A56",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Tải lại trang
                        </button>
                        <button
                            type="button"
                            onClick={this.handleHome}
                            style={{
                                padding: "10px 20px",
                                background: "#fff",
                                color: "#2D3142",
                                border: "1px solid #e5e7eb",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
