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
</head>

<body style="overflow: hidden; margin: 0; box-sizing: border-box">

<c:set var="targetId" value="reactComponent${fn:replace(currentNode.identifier,'-','_')}"/>
<div id="${targetId}">loading..</div>

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
