<%@ page import="org.jahia.bin.Jahia" %>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="contextPath" type="java.lang.String"--%>
<%--@elvariable id="currentUser" type="org.jahia.services.usermanager.JahiaUser"--%>
<%@ taglib prefix="internal" uri="http://www.jahia.org/tags/internalLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="user" uri="http://www.jahia.org/tags/user" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<html>

<head>
    <meta charset="utf-8">
    <title>Jahia</title>

    <internal:gwtGenerateDictionary/>
    <internal:gwtInit locale="${language}"/>

    <script type="text/javascript">
        Object.assign(window.contextJsParameters, {
            // Theses values are for GWT only
            siteKey: '${defaultSite.siteKey}',
            siteUuid: '${defaultSite.identifier}',

            version: '<%= Jahia.VERSION %>',
            contextPath: '${contextPath}',
            user: {
                username: '${functions:escapeJavaScript(currentUser.name)}',
                fullname: '${functions:escapeJavaScript(user:fullName(currentUser))}',
                firstName: '${functions:escapeJavaScript(currentUser.properties['j:firstName'])}',
                lastName: '${functions:escapeJavaScript(currentUser.properties['j:lastName'])}',
                email: '${functions:escapeJavaScript(currentUser.properties['j:email'])}',
                path: '${functions:escapeJavaScript(currentUser.localPath)}'
            },
            valid: <%= !Jahia.isEnterpriseEdition() || org.jahia.modules.appshell.License.isAllowed("org.jahia.core") %>,
            config: ${config},
            site: '${defaultSite.siteKey}',
            language: '${language}',
            urlbase: '<c:url value="/modules/appshell/${appName}"/>'
        });
        // Loader resource listener
        const bundlesLoaded = [];
        const loaderResourceListener = e => {
            if (e.target.nodeName === "SCRIPT") {
                // Count script tag in the page
                const totalScripts = document.querySelectorAll('script').length;
                const b = e.target.getAttribute("data-webpack")?.split(':')[0];

                if (b && !bundlesLoaded.includes(b)) {
                    bundlesLoaded.push(b);
                    document.querySelector('.jahia-loading_text').innerHTML = '<fmt:message bundle="${bundle}" key="label.loading"/> (' + b + ' ' + bundlesLoaded.length +  ' / ${remotes.size() + 1})';
                }
            }
        };


        const removeLoaderResourceListener = () => {
            document.removeEventListener("load", loaderResourceListener, true);
        };
        // Register callback function to execute when loading is done.
        window.jahiaLoading = {jahiaLoadedCallback: () => removeLoaderResourceListener()};
        // Register listener for loader resource
        document.addEventListener("load", loaderResourceListener, true);
    </script>
    <internal:gwtImport module="empty"/>

    <link rel="stylesheet" type="text/css" media="screen"
          href="<c:url value='/engines/jahia-anthracite/css/edit_${anthraciteUiLocale}.css'/>"/>
    <style>
        @keyframes loadingBar {
            0% {
                width: 5%
            }

            20% {
                width: 62%
            }

            44% {
                width: 85%
            }

            80% {
                width: 90%
            }

            100% {
                width: 100%
            }
        }


        @keyframes ripple {
            22% {
                opacity: 0;
                transform: scale(1)
            }

            78% {
                opacity: .15;
                transform: scale(160)
            }

            100% {
                opacity: 0;
                transform: scale(180)
            }
        }


        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            box-sizing: border-box;
            font-family: sans-serif;
        }

        .jahia-loader {
            height: 100vh;
            width: 100vw;
            padding-top: 30vh;
            font-size: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 56px;
            background-color: #293136;
            color: #fefefe;
        }

        .jahia-loading_progress {
            width: 300px;
            height: 4px;
            background-color: rgba(255, 255, 255, .3);
            border-radius: 20px;
            margin-bottom: 12px;
            position: relative;
        }

        .jahia-loading_progress:after {
            content: "";
            position: absolute;
            inset: 0;
            display: block;
            height: 4px;
            background-color: #00A0E3;
            border-radius: 20px;
            animation: loadingBar 12s infinite;
        }

        .jahia-loading_text {
            font-size: 14px;
        }

        .jahia-loading_timeout {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }

        .jahia-loading_timeout_title {
            margin-top: 0;
        }

        .jahia-loading_timeout p {
            margin: 0 0 8px;
        }

        .jahia-button {
            border: 1px solid currentColor;
            padding: 8px 24px;
            border-radius: 8px;
            background-color: transparent;
            color: currentColor;
            cursor: pointer;
            margin: 24px 0;
            font-size: 16px;
        }

        .jahia-button:hover {
            color: #00A0E3;
        }

        .is-hidden {
            display: none !important;
        }


        .jahia-loader-ripple {
            margin-left: -1px;
            width: 10px;
            height: 10px;
            left: 50vw;
            top: 50vh;
            opacity: 0;
            border-radius: 50%;
            animation: ripple 1.8s;
            animation-delay: .4s;
            position: absolute;
            background-color: #515151;
        }


        /* Error page */
        .page-error {
            background-size: 95%;
            background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjI1MyIgaGVpZ2h0PSI0OTgiIHZpZXdCb3g9IjAgMCAyMjUzIDQ5OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAuMjQ0NDA0IDQ5MS40OTVWNi40NTQ2SDM0NC45MzJWMTA0LjE1MUgxMjMuMzk2VjE5Ni4zNDNIMzMxLjE3MlYyOTMuMzUxSDEyMy4zOTZWMzkzLjc5OUgzNDQuOTMyVjQ5MS40OTVIMC4yNDQ0MDRaTTgxOC45NTIgNDkxLjQ5NUg2NzkuOTc2TDU5Ni4wNCAzMzYuNjk1QzU4NS40OTEgMzE4LjgwNyA1NjguNzQ5IDMwOS44NjMgNTQ1LjgxNiAzMDkuODYzSDUwNy4yODhWNDkxLjQ5NUgzODIuNzZWNi40NTQ2SDYxMy45MjhDNjcyLjYzNyA2LjQ1NDYgNzE2LjY2OSAxOS4yOTczIDc0Ni4wMjQgNDQuOTgyNkM3NzUuODM3IDcwLjIwOTMgNzkwLjc0NCAxMDYuOTAzIDc5MC43NDQgMTU1LjA2M0M3OTAuNzQ0IDE5MS43NTYgNzgwLjY1MyAyMjIuOTQ1IDc2MC40NzIgMjQ4LjYzMUM3NDAuMjkxIDI3My44NTcgNzExLjg1MyAyOTAuODI4IDY3NS4xNiAyOTkuNTQzQzcwMy4xMzkgMzA1LjUwNSA3MjUuMzg0IDMyMy42MjMgNzQxLjg5NiAzNTMuODk1TDgxOC45NTIgNDkxLjQ5NVpNNTkzLjk3NiAyMTQuOTE5QzYyMS45NTUgMjE0LjkxOSA2NDEuOTA3IDIxMC41NjEgNjUzLjgzMiAyMDEuODQ3QzY2Ni4yMTYgMTkzLjEzMiA2NzIuNDA4IDE3OC45MTMgNjcyLjQwOCAxNTkuMTkxQzY3Mi40MDggMTM5LjAwOSA2NjYuMjE2IDEyNC41NjEgNjUzLjgzMiAxMTUuODQ3QzY0MS45MDcgMTA2LjY3MyA2MjEuOTU1IDEwMi4wODcgNTkzLjk3NiAxMDIuMDg3SDUwNS45MTJWMjE0LjkxOUg1OTMuOTc2Wk0xMjc3LjM5IDQ5MS40OTVIMTEzOC40MUwxMDU0LjQ4IDMzNi42OTVDMTA0My45MyAzMTguODA3IDEwMjcuMTkgMzA5Ljg2MyAxMDA0LjI1IDMwOS44NjNIOTY1LjcyNlY0OTEuNDk1SDg0MS4xOThWNi40NTQ2SDEwNzIuMzdDMTEzMS4wNyA2LjQ1NDYgMTE3NS4xMSAxOS4yOTczIDEyMDQuNDYgNDQuOTgyNkMxMjM0LjI3IDcwLjIwOTMgMTI0OS4xOCAxMDYuOTAzIDEyNDkuMTggMTU1LjA2M0MxMjQ5LjE4IDE5MS43NTYgMTIzOS4wOSAyMjIuOTQ1IDEyMTguOTEgMjQ4LjYzMUMxMTk4LjczIDI3My44NTcgMTE3MC4yOSAyOTAuODI4IDExMzMuNiAyOTkuNTQzQzExNjEuNTggMzA1LjUwNSAxMTgzLjgyIDMyMy42MjMgMTIwMC4zMyAzNTMuODk1TDEyNzcuMzkgNDkxLjQ5NVpNMTA1Mi40MSAyMTQuOTE5QzEwODAuMzkgMjE0LjkxOSAxMTAwLjM0IDIxMC41NjEgMTExMi4yNyAyMDEuODQ3QzExMjQuNjUgMTkzLjEzMiAxMTMwLjg1IDE3OC45MTMgMTEzMC44NSAxNTkuMTkxQzExMzAuODUgMTM5LjAwOSAxMTI0LjY1IDEyNC41NjEgMTExMi4yNyAxMTUuODQ3QzExMDAuMzQgMTA2LjY3MyAxMDgwLjM5IDEwMi4wODcgMTA1Mi40MSAxMDIuMDg3SDk2NC4zNVYyMTQuOTE5SDEwNTIuNDFaTTE1MjYuNzYgNDk3LjY4N0MxNDc3LjIyIDQ5Ny42ODcgMTQzNC4xIDQ4Ny41OTYgMTM5Ny40MSA0NjcuNDE1QzEzNjEuMTggNDQ2Ljc3NSAxMzMzLjIgNDE3Ljg3OSAxMzEzLjQ4IDM4MC43MjdDMTI5My43NSAzNDMuMTE2IDEyODMuODkgMjk5LjA4NCAxMjgzLjg5IDI0OC42MzFDMTI4My44OSAxOTguMTc3IDEyOTMuNzUgMTU0LjM3NSAxMzEzLjQ4IDExNy4yMjNDMTMzMy4yIDc5LjYxMTkgMTM2MS4xOCA1MC43MTU5IDEzOTcuNDEgMzAuNTM0NkMxNDM0LjEgMTAuMzUzMyAxNDc3LjIyIDAuMjYyNTk3IDE1MjYuNzYgMC4yNjI1OTdDMTU3Ni4yOSAwLjI2MjU5NyAxNjE5LjE4IDEwLjM1MzMgMTY1NS40MSAzMC41MzQ2QzE2OTIuMSA1MC43MTU5IDE3MjAuMDggNzkuNjExOSAxNzM5LjM1IDExNy4yMjNDMTc1OS4wNyAxNTQuMzc1IDE3NjguOTMgMTk4LjE3NyAxNzY4LjkzIDI0OC42MzFDMTc2OC45MyAyOTkuMDg0IDE3NTkuMDcgMzQzLjExNiAxNzM5LjM1IDM4MC43MjdDMTcxOS42MiA0MTcuODc5IDE2OTEuNDIgNDQ2Ljc3NSAxNjU0LjcyIDQ2Ny40MTVDMTYxOC40OSA0ODcuNTk2IDE1NzUuODMgNDk3LjY4NyAxNTI2Ljc2IDQ5Ny42ODdaTTE1MjYuNzYgNDAwLjY3OUMxNTYzLjQ1IDQwMC42NzkgMTU5Mi4xMiAzODcuODM2IDE2MTIuNzYgMzYyLjE1MUMxNjMzLjQgMzM2LjAwNyAxNjQzLjcyIDI5OC4xNjcgMTY0My43MiAyNDguNjMxQzE2NDMuNzIgMTk5LjA5NSAxNjMzLjE3IDE2MS40ODQgMTYxMi4wNyAxMzUuNzk5QzE1OTEuNDMgMTEwLjExMyAxNTYyLjk5IDk3LjI3MDYgMTUyNi43NiA5Ny4yNzA2QzE0OTAuMDYgOTcuMjcwNiAxNDYxLjQgMTEwLjExMyAxNDQwLjc2IDEzNS43OTlDMTQyMC4xMiAxNjEuMDI1IDE0MDkuOCAxOTguNjM2IDE0MDkuOCAyNDguNjMxQzE0MDkuOCAyOTguNjI1IDE0MjAuMTIgMzM2LjQ2NSAxNDQwLjc2IDM2Mi4xNTFDMTQ2MS40IDM4Ny44MzYgMTQ5MC4wNiA0MDAuNjc5IDE1MjYuNzYgNDAwLjY3OVpNMjI1Mi4wNSA0OTEuNDk1SDIxMTMuMDdMMjAyOS4xMyAzMzYuNjk1QzIwMTguNTggMzE4LjgwNyAyMDAxLjg0IDMwOS44NjMgMTk3OC45MSAzMDkuODYzSDE5NDAuMzhWNDkxLjQ5NUgxODE1Ljg1VjYuNDU0NkgyMDQ3LjAyQzIxMDUuNzMgNi40NTQ2IDIxNDkuNzYgMTkuMjk3MyAyMTc5LjEyIDQ0Ljk4MjZDMjIwOC45MyA3MC4yMDkzIDIyMjMuODQgMTA2LjkwMyAyMjIzLjg0IDE1NS4wNjNDMjIyMy44NCAxOTEuNzU2IDIyMTMuNzUgMjIyLjk0NSAyMTkzLjU3IDI0OC42MzFDMjE3My4zOCAyNzMuODU3IDIxNDQuOTUgMjkwLjgyOCAyMTA4LjI1IDI5OS41NDNDMjEzNi4yMyAzMDUuNTA1IDIxNTguNDggMzIzLjYyMyAyMTc0Ljk5IDM1My44OTVMMjI1Mi4wNSA0OTEuNDk1Wk0yMDI3LjA3IDIxNC45MTlDMjA1NS4wNSAyMTQuOTE5IDIwNzUgMjEwLjU2MSAyMDg2LjkzIDIwMS44NDdDMjA5OS4zMSAxOTMuMTMyIDIxMDUuNSAxNzguOTEzIDIxMDUuNSAxNTkuMTkxQzIxMDUuNSAxMzkuMDA5IDIwOTkuMzEgMTI0LjU2MSAyMDg2LjkzIDExNS44NDdDMjA3NSAxMDYuNjczIDIwNTUuMDUgMTAyLjA4NyAyMDI3LjA3IDEwMi4wODdIMTkzOS4wMVYyMTQuOTE5SDIwMjcuMDdaIiBmaWxsPSIjRkRGREZEIiBmaWxsLW9wYWNpdHk9IjAuNCIvPgo8L3N2Zz4K");
            background-repeat: no-repeat;
            background-position: center;
            background-attachment: fixed;
            display: flex;
            flex: 1;
            min-height: 100vh;
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0;
        }

        .page-error-wrapper {
            width: 900px;
            text-align: center;
            padding: 120px 40px 40px 40px;
        }

        .page-error-description {
            margin-bottom: var(--spacing-small);
        }


        .page-error-title {
            font-weight: bold;
            font-size: 1.75rem;
            line-height: 2rem;
            margin: 0 auto 40px;
        }

        .page-error-log {
            text-align: left;
            font-family: monospace;
            line-height: 1.3rem;
            margin: var(--spacing-huge) 0;
            overflow: auto;
            font-size: 14px;
            padding: 16px;
            white-space: pre-line;
            background: #fff;
            border: 1px solid #dadada;
        }

        .page-error-link {
            color: var(--color-accent);
        }

        .page-error-link:hover {
            color: var(--color-accent_dark)
        }

    </style>
</head>

<body>
<div class="jahia-loader">
    <!-- Logo -->
    <svg xmlns="http://www.w3.org/2000/svg" width="176" height="80" viewBox="0 0 176 80" fill="none">
        <path
                d="M10.6889 59.9247C10.6889 62.7674 9.56386 65.4942 7.56025 67.5074C5.55664 69.5207 2.83795 70.6561 0 70.665V80C2.62753 79.9956 5.22848 79.4729 7.65432 78.4616C10.0802 77.4504 12.2834 75.9704 14.1383 74.1062C15.9931 72.2421 17.4632 70.0302 18.4647 67.5969C19.4662 65.1637 19.9793 62.5566 19.975 59.9247V25.1276C16.7135 26.5394 13.6025 28.2769 10.6889 30.3137V59.9247ZM156.025 20.0084C153.335 19.8981 150.651 20.3336 148.134 21.2886C145.616 22.2435 143.318 23.6984 141.376 25.5656C139.434 27.4329 137.889 29.6741 136.833 32.1545C135.778 34.635 135.233 37.3036 135.233 40C135.233 42.6964 135.778 45.365 136.833 47.8455C137.889 50.3259 139.434 52.5671 141.376 54.4344C143.318 56.3016 145.616 57.7565 148.134 58.7114C150.651 59.6664 153.335 60.1019 156.025 59.9916H160.2V50.6901H156.025C153.911 50.6901 151.844 50.0621 150.087 48.8857C148.329 47.7092 146.959 46.037 146.15 44.0806C145.341 42.1242 145.129 39.9714 145.541 37.8945C145.954 35.8176 146.972 33.9098 148.467 32.4124C149.962 30.915 151.866 29.8953 153.94 29.4822C156.013 29.0691 158.162 29.2811 160.116 30.0915C162.069 30.9018 163.738 32.2742 164.913 34.0349C166.087 35.7956 166.714 37.8657 166.714 39.9833V59.9916H176V39.9833C176 37.3573 175.483 34.7571 174.479 32.3315C173.475 29.9058 172.003 27.7023 170.147 25.847C168.292 23.9918 166.09 22.5211 163.667 21.5193C161.243 20.5174 158.647 20.004 156.025 20.0084ZM92.8601 20.0084C89.084 20.0016 85.3855 21.0817 82.2046 23.12V0H72.9186V59.9916H82.2046V39.9833C82.3572 37.2515 83.5481 34.6819 85.5328 32.8021C87.5175 30.9222 90.1453 29.8747 92.8768 29.8747C95.6083 29.8747 98.2361 30.9222 100.221 32.8021C102.205 34.6819 103.396 37.2515 103.549 39.9833V59.9916H112.835V39.9833C112.835 37.3573 112.318 34.7571 111.314 32.3315C110.31 29.9058 108.838 27.7023 106.983 25.847C105.127 23.9918 102.925 22.5211 100.502 21.5193C98.0784 20.5174 95.4817 20.004 92.8601 20.0084ZM119.816 59.9916H129.102V30.3137C126.184 28.2838 123.074 26.5467 119.816 25.1276V59.9916ZM45.9624 20.0084C43.2728 19.8981 40.5886 20.3336 38.0712 21.2886C35.5538 22.2435 33.2551 23.6984 31.3131 25.5656C29.3711 27.4329 27.8259 29.6741 26.7704 32.1545C25.7149 34.635 25.1708 37.3036 25.1708 40C25.1708 42.6964 25.7149 45.365 26.7704 47.8455C27.8259 50.3259 29.3711 52.5671 31.3131 54.4344C33.2551 56.3016 35.5538 57.7565 38.0712 58.7114C40.5886 59.6664 43.2728 60.1019 45.9624 59.9916H50.1378V50.6901H45.9624C43.8483 50.6901 41.7817 50.0621 40.024 48.8857C38.2662 47.7092 36.8962 46.037 36.0871 44.0806C35.2781 42.1242 35.0664 39.9714 35.4789 37.8945C35.8913 35.8176 36.9093 33.9098 38.4042 32.4124C39.8991 30.915 41.8037 29.8953 43.8771 29.4822C45.9506 29.0691 48.0997 29.2811 50.0529 30.0915C52.006 30.9018 53.6754 32.2742 54.85 34.0349C56.0245 35.7956 56.6514 37.8657 56.6514 39.9833V59.9916H65.9374V39.9833C65.9374 37.3573 65.4204 34.7571 64.4162 32.3315C63.412 29.9058 61.9401 27.7023 60.0848 25.847C58.2295 23.9918 56.0272 22.5211 53.604 21.5193C51.1807 20.5174 48.584 20.004 45.9624 20.0084Z"
                fill="white"/>
        <path fill-rule="evenodd" clip-rule="evenodd"
              d="M19.9525 16.6223V10.6666H10.6665V21.34C13.6171 19.4965 16.7245 17.9178 19.9525 16.6223ZM119.794 16.6223V10.6666H129.08V21.34C126.122 19.5096 123.016 17.9315 119.794 16.6223Z"
              fill="#00A0E3"/>
    </svg>
    <!-- Loading in progress -->
    <div class="jahia-loading">
        <div class="jahia-loading_progress"></div>
        <span class="jahia-loading_text"><fmt:message key="label.loading" bundle="${bundle}"/></span>
    </div>
    <!-- Loading Timeout -->
    <div class="jahia-loading_timeout is-hidden">
        <fmt:message key="label.loading.timeout" bundle="${bundle}"/>
        <button class="jahia-button" onClick="window.location.reload()">
            <fmt:message key="label.loading.reload" bundle="${bundle}"/></button>
    </div>

    <div class="jahia-loader-ripple"></div>
</div>
<div class="page-error is-hidden">
    <main class="page-error-wrapper">
        <h1 class="page-error-title"><fmt:message bundle="${bundle}" key="label.error.title"/></h1>
        <fmt:message bundle="${bundle}" key="label.error.desc"/>
        <pre class="page-error-log">
        </pre>
    </main>
</div>

<c:set var="targetId" value="reactComponent"/>
<div id="${targetId}"></div>

<div id="gwt-root"></div>


<script type="text/javascript"
        src="<c:url value='/engines/jahia-anthracite/js/dist/build/anthracite-min.js'/>"></script>
<script type="text/javascript">
    setTimeout(() => {
        // in case loader still present after 1 minute, display reload message
        document.querySelector('.jahia-loading_timeout').classList.remove('is-hidden');
    }, 90000)
    window.appShell = {
        remotes: {},
        scripts: ${scripts},
        targetId: "${targetId}",
    };
    window.jahiaCommons = function (module) {
        if (jahia.modules[module]) {
            return (jahia.modules[module]);
        } else {
            console.error("Cannot find module", module)
        }
    }
</script>
<c:forEach items="${remotes}" var="remote">
    <script src="<c:url value="${remote}"/>"></script>
</c:forEach>
<script src="<c:url value="/modules/app-shell/javascript/apps/appshell.js"/>"></script>
</body>
