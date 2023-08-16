import About from "pages/about/pageIndex.xht";
import Us from "pages/about/us/pageIndex.xht";
import Baruak from "pages/baruak/pageIndex.xht";
import Home from "pages/Home.xht";
export default [
	{ path: "/", page: Home },
	{ path: "/baruak/:page", page: Baruak },
	{ path: "/about/us/:page", page: Us },
	{ path: "/about/:page", page: About },
]