import { Config } from "@remotion/cli/config";
// @ts-ignore
import { webpackOverride } from "./webpack-override.mjs";
Config.overrideWebpackConfig(webpackOverride);
Config.setVideoImageFormat("jpeg");
Config.setChromiumOpenGlRenderer("swangle");
