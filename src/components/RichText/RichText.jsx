import "./RichText.css";

/**
 * Renders plain text stored by the API: blocks separated by a blank line are
 * paragraphs, and a block starting with "### " is a subheading. Everything is
 * rendered as text, never as HTML, so stored content cannot inject markup.
 */
function RichText({ text, className = "" }) {
  const blocks = (text ?? "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className={`rich-text ${className}`}>
      {blocks.map((block, index) =>
        block.startsWith("### ") ? (
          <h3 key={index} className="rich-text__heading">
            {block.slice(4)}
          </h3>
        ) : (
          <p key={index}>{block}</p>
        ),
      )}
    </div>
  );
}

export default RichText;
