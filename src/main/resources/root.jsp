<%@ page import="org.jahia.bin.Jahia" %><%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="contextPath" type="java.lang.String"--%>
<%--@elvariable id="currentUser" type="org.jahia.services.usermanager.JahiaUser"--%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="user" uri="http://www.jahia.org/tags/user" %>
<%@ taglib prefix="js" uri="http://www.jahia.org/tags/dxwebpack" %>
<%@ taglib prefix="internal" uri="http://www.jahia.org/tags/internalLib" %>

<html>

<head>
    <meta charset="utf-8">
    <title>Jahia</title>

    <internal:gwtGenerateDictionary/>
    <internal:gwtInit/>
    <internal:gwtImport module="empty"/>

    <link rel="stylesheet" type="text/css" media="screen" href="<c:url value='/engines/jahia-anthracite/css/edit_V8_en.css'/>" />
    <link rel="stylesheet" type="text/css" media="screen" href="<c:url value='/modules/dx-commons-webpack/css/loader.css'/>" />
</head>

<body>
  <!-- Loader to display before react will delete this div-->
  <div class="jahia-loader">
    <div class="jahia-loader-main">
      <div class="jahia-logo"><svg width="200" height="70" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect width="200" height="200" fill="url(#pattern0)"/>
          <defs>
            <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
              <use xlink:href="#image0" transform="scale(0.00504444)"/>
              </pattern>
              <image id="image0" width="200" height="80" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABQCAYAAABcbTqwAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFGmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMDYtMjFUMTc6MzcrMDI6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTA2LTI3VDE0OjMxOjQ5KzAyOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTA2LTI3VDE0OjMxOjQ5KzAyOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjdlNWQ2MDg4LWMwMDgt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"/>
            </defs>
          </svg>
        </div>
        <div class="jahia-loading"><span class="jahia-loading-progress"></span></div>
      </div>
    <div class="jahia-loader-ripple"></div>
  </div>

<c:set var="targetId" value="reactComponent${fn:replace(currentNode.identifier,'-','_')}"/>
<div id="${targetId}"></div>

<div id="gwt-root"></div>


<script>window.anthraciteV8 = true;</script>
<script type="text/javascript" src="<c:url value='/engines/jahia-anthracite/js/dist/build/anthracite-min.js'/>"></script>
<script src="${contextPath}/modules/dx-commons-webpack/javascript/commons/jahia-commons.dll.js"></script>
<script src="${contextPath}/modules/dx-commons-webpack/javascript/apps/appshell.js"></script>
<script type="text/javascript">
    Object.assign(window.contextJsParameters, {
        version: '<%= Jahia.VERSION %>',
        contextPath: '${contextPath}',
        user: {
            username: '${currentUser.name}',
            fullname: '${user:fullName(currentUser)}',
            email: '${currentUser.properties['j:email']}',
            path: '${currentUser.localPath}'
        },
        config: ${config},
        urlbase: '/modules/appshell/${appName}'
    });

    jahia.startAppShell(${scripts}, true, "${targetId}");
</script>
</body>
