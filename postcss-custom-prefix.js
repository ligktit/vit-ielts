module.exports = () => {
  return {
    postcssPlugin: "postcss-custom-prefix",
    Rule(rule) {
      const rootFile = rule.root().source?.input?.file || "";
      if (!rootFile.replace(/\\/g, "/").endsWith("appx/styles/globals.css")) {
        return;
      }
      if (rule.parent && rule.parent.type === "atrule" && rule.parent.name === "keyframes") {
        return;
      }
      rule.selectors = rule.selectors.map((selector) => {
        if (selector === "html" || selector === "body" || selector === ":root") {
          return ".frontend-site";
        }
        if (selector.startsWith(".frontend-site")) {
          return selector;
        }
        return `.frontend-site ${selector}`;
      });
    },
  };
};
module.exports.postcss = true;
