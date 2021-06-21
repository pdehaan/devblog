require("dotenv").config();

let domain_name = "http://localhost:8080";

if (process.env.IS_LOCAL) {
	domain_name = "https://fightwithtools.dev/";
}

module.exports = () => {
	return {
		lang: "en-US",
		github: {
			build_revision: 1.0,
		},
		site_url: domain_name,
	};
};
