import SVG from "react-inlinesvg";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const vercelCommitHash = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const commitHash = vercelCommitHash ? `-${vercelCommitHash.slice(0, 7)}` : "";

// In Alloy sandbox sessions the app is reached via the preview proxy, so the
// configured NEXT_PUBLIC_WEBAPP_URL (e.g. http://localhost:3000) is not
// resolvable from the user's browser. Use a same-origin path so the sprite
// loads through whatever origin the user is on.
const baseUrl = process.env.IS_ALLOY === "true" ? "" : process.env.NEXT_PUBLIC_WEBAPP_URL;

export function IconSprites() {
  return (
    <SVG src={`${baseUrl}/icons/sprite.svg?v=${process.env.NEXT_PUBLIC_CALCOM_VERSION}-${commitHash}`} />
  );
}

export default IconSprites;
