"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden transition-all duration-700 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* 背景装饰 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 bg-purple-300 rounded-full w-96 h-96 mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 bg-yellow-300 rounded-full w-96 h-96 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bg-pink-300 rounded-full -bottom-8 left-20 w-96 h-96 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 flex flex-col items-center w-full max-w-4xl gap-10 p-8 mx-auto">
        <div className="flex flex-col items-center w-full gap-8 p-10 border shadow-2xl border-gray-200/30 bg-white/90 dark:bg-gray-900/90 rounded-3xl dark:border-gray-700/50 backdrop-blur-lg">
          {/* Logo区域 */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-75 bg-gradient-to-r from-blue-500 to-purple-500 blur"></div>
              <div className="relative p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <Image
                  className="dark:invert drop-shadow-lg"
                  src="/next.svg"
                  alt="MCP Tools logo"
                  width={200}
                  height={42}
                  priority
                />
              </div>
            </div>

            <h1 className="text-5xl font-bold text-center text-transparent md:text-6xl bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              MCP 工具箱
            </h1>
            <p className="max-w-2xl text-xl text-center text-gray-600 dark:text-gray-300">
              开发、测试和部署你的现代 MCP 工具，提升工作效率
            </p>
          </div>

          {/* 功能卡片 */}
          <div className="grid w-full max-w-4xl grid-cols-1 gap-6 mt-4 md:grid-cols-3">
            <div className="p-5 transition-all duration-300 border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-xl border-gray-200/30 dark:border-gray-700/30 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white">
                快速开发
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                使用现代化工具链快速构建 MCP 工具
              </p>
            </div>

            <div className="p-5 transition-all duration-300 border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-xl border-gray-200/30 dark:border-gray-700/30 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white">
                安全可靠
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                内置安全机制，保护您的数据和隐私
              </p>
            </div>

            <div className="p-5 transition-all duration-300 border bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 rounded-xl border-gray-200/30 dark:border-gray-700/30 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white">
                高效协作
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                支持团队协作，共享工具和资源
              </p>
            </div>
          </div>

          {/* 操作指南 */}
          <div className="w-full max-w-2xl mx-auto">
            <h2 className="mb-4 text-xl font-bold text-center text-gray-800 dark:text-white">
              快速开始
            </h2>
            <ol className="w-full space-y-3 font-mono text-base text-left text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-white bg-blue-500 rounded-full">
                  1
                </span>
                <span>
                  编辑{" "}
                  <code className="px-2 py-1 font-mono font-semibold text-blue-600 bg-gray-100 rounded dark:bg-gray-800 dark:text-blue-400">
                    src/app/page.tsx
                  </code>{" "}
                  开始你的项目。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-white bg-purple-500 rounded-full">
                  2
                </span>
                <span>保存后即可实时预览效果。</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-white rounded-full bg-cyan-500">
                  3
                </span>
                <span>
                  使用{" "}
                  <code className="px-2 py-1 font-mono font-semibold text-purple-600 bg-gray-100 rounded dark:bg-gray-800 dark:text-purple-400">
                    npm run dev
                  </code>{" "}
                  启动开发服务器。
                </span>
              </li>
            </ol>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col justify-center w-full gap-4 mt-6 sm:flex-row">
            <a
              className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform shadow-lg rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1"
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              一键部署
            </a>
            <a
              className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-gray-800 transition-all duration-300 transform border border-gray-300 dark:text-white rounded-xl dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg hover:-translate-y-1"
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              查看文档
            </a>
          </div>
        </div>
      </main>
      <footer className="relative z-10 flex flex-col items-center w-full gap-4 mt-12 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <a
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer">
            <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800">
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={20}
                height={20}
              />
            </div>
            <span className="font-medium">学习</span>
          </a>
          <a
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer">
            <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800">
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={20}
                height={20}
              />
            </div>
            <span className="font-medium">示例</span>
          </a>
          <a
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer">
            <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800">
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={20}
                height={20}
              />
            </div>
            <span className="font-medium">Next.js 官网 →</span>
          </a>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} MCP 工具箱 - 基于 Next.js & Tailwind CSS
          构建
        </span>
      </footer>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
