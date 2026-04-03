import katex from "katex";

function FormulaBlock({ formula }) {
  const html = katex.renderToString(formula, {
    throwOnError: false,
    displayMode: true
  });

  return <div className="formula-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default FormulaBlock;
