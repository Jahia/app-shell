<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
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
    <script src="${contextPath}/modules/dx-commons-webpack/javascript/js-load.js"></script>
    <js:loader target="jahia-extends"/>

    <link rel="stylesheet" type="text/css" media="screen" href="<c:url value='/engines/jahia-anthracite/css/edit_V8_en.css'/>" />
    <script>
        var anthraciteV8 = true;
    </script>
    <script type="text/javascript" src="<c:url value='/engines/jahia-anthracite/js/dist/build/anthracite-min.js'/>"></script>
</head>

<body style="overflow: hidden; margin: 0; box-sizing: border-box">

<internal:gwtGenerateDictionary/>
<internal:gwtInit/>
<internal:gwtImport module="empty"/>

<c:set var="targetId" value="reactComponent${fn:replace(currentNode.identifier,'-','_')}"/>
<div id="${targetId}">loading..</div>

<div id="gwt-root"></div>



<script type="text/javascript">
    window.contextJsParameters = window.contextJsParameters || {};
    window.contextJsParameters = Object.assign({}, window.contextJsParameters, {
        targetId: '${targetId}',
        contextPath: '${contextPath}',
        locale: '${currentResource.locale}',
        user: {
            username: '${currentUser.name}',
            fullname: '${user:fullName(currentUser)}',
            email: '${currentUser.properties['j:email']}',
            path: '${currentUser.localPath}'
        },
        config: ${config},
        urlbase: '/modules/appshell/${appName}'
    });

    bootstrap(${scripts}, true);
</script>

</body>
