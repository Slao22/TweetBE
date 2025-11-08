export function AuthFooter() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-gray-500">
            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4">
                {[
                    "About",
                    "Download the X app",
                    "Help Center",
                    "Terms of Service",
                    "Privacy Policy",
                    "Cookie Policy",
                    "Accessibility",
                    "Ads info",
                    "Blog",
                    "Careers",
                    "Brand Resources",
                    "Advertising",
                    "Marketing",
                ].map((item) => (
                    <a key={item} href="#" className="hover:underline">
                        {item}
                    </a>
                ))}
                <span>© 2025 X Corp.</span>
            </nav>
        </footer>
    );
}
