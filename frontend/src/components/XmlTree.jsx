import React from "react";

function nodeToTree(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    return text ? <span className="xml-value">{text}</span> : null;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const attributes = [...node.attributes].map((attribute) => (
    <span className="xml-attr" key={attribute.name}>
      {" "}
      {attribute.name}="{attribute.value}"
    </span>
  ));
  const children = [...node.childNodes].map((child, index) => <li key={index}>{nodeToTree(child)}</li>).filter(Boolean);

  return (
    <details open>
      <summary>
        <span className="xml-tag">&lt;{node.nodeName}</span>
        {attributes}
        <span className="xml-tag">&gt;</span>
      </summary>
      {children.length > 0 && <ul>{children}</ul>}
      <span className="xml-tag">&lt;/{node.nodeName}&gt;</span>
    </details>
  );
}

export default function XmlTree({ xml }) {
  if (!xml) {
    return null;
  }

  const parser = new DOMParser();
  const documentXml = parser.parseFromString(xml, "text/xml");
  const parserError = documentXml.querySelector("parsererror");

  if (parserError) {
    return <p className="error-text">No se pudo interpretar el reporte XML.</p>;
  }

  return <div className="xml-tree">{nodeToTree(documentXml.documentElement)}</div>;
}
