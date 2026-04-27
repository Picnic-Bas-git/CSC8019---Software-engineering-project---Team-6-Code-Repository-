#!/usr/bin/env python3
"""
Convert Markdown file to PDF with styling
"""
import markdown
from weasyprint import HTML, CSS
from pathlib import Path
import sys

def convert_markdown_to_pdf(md_file, output_pdf):
    """Convert Markdown file to PDF"""
    
    # Read markdown file
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'toc']
    )
    
    # Create HTML with CSS styling
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>UML Database Design</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 2cm;
                background: white;
            }}
            
            h1 {{
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 0.5em;
                page-break-after: avoid;
            }}
            
            h2 {{
                color: #34495e;
                border-left: 4px solid #3498db;
                padding-left: 0.5em;
                margin-top: 1.5em;
                page-break-after: avoid;
            }}
            
            h3 {{
                color: #555;
                margin-top: 1.2em;
                page-break-after: avoid;
            }}
            
            h4 {{
                color: #666;
                page-break-after: avoid;
            }}
            
            p {{
                margin: 0.5em 0;
            }}
            
            code {{
                background-color: #f4f4f4;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
            }}
            
            pre {{
                background-color: #f4f4f4;
                padding: 1em;
                border-radius: 5px;
                overflow-x: auto;
                page-break-inside: avoid;
                border-left: 3px solid #3498db;
            }}
            
            pre code {{
                background-color: transparent;
                padding: 0;
                border-radius: 0;
            }}
            
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
                page-break-inside: avoid;
            }}
            
            table th {{
                background-color: #3498db;
                color: white;
                padding: 0.7em;
                text-align: left;
                font-weight: bold;
            }}
            
            table td {{
                border: 1px solid #ddd;
                padding: 0.7em;
            }}
            
            table tr:nth-child(even) {{
                background-color: #f9f9f9;
            }}
            
            table tr:hover {{
                background-color: #f0f0f0;
            }}
            
            ul, ol {{
                margin: 0.5em 0;
                padding-left: 2em;
            }}
            
            li {{
                margin: 0.3em 0;
            }}
            
            blockquote {{
                border-left: 4px solid #3498db;
                padding-left: 1em;
                margin-left: 0;
                color: #666;
            }}
            
            .mermaid {{
                page-break-inside: avoid;
                margin: 1em 0;
                text-align: center;
            }}
            
            hr {{
                border: none;
                border-top: 2px solid #3498db;
                margin: 2em 0;
            }}
            
            strong {{
                color: #2c3e50;
                font-weight: bold;
            }}
            
            em {{
                font-style: italic;
            }}
            
            @page {{
                size: A4;
                margin: 2cm;
                @bottom-center {{
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 12px;
                    color: #999;
                }}
            }}
            
            @page :first {{
                margin-top: 3cm;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Convert HTML to PDF
    HTML(string=full_html).write_pdf(output_pdf)
    print(f"✓ Successfully converted to PDF: {output_pdf}")

if __name__ == '__main__':
    md_file = 'UML_DATABASE_DESIGN.md'
    output_pdf = 'UML_DATABASE_DESIGN.pdf'
    
    if not Path(md_file).exists():
        print(f"Error: {md_file} not found")
        sys.exit(1)
    
    try:
        convert_markdown_to_pdf(md_file, output_pdf)
    except Exception as e:
        print(f"Error converting file: {e}")
        sys.exit(1)
