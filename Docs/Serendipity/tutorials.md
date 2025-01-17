To implement a "dspy rag" (a diagnostic spy regex-aware grep-like tool) that respects `.gitignore` rules in a codebase, you can leverage Python modules such as `pathspec` to parse `.gitignore` and use the `re` module for regex matching. Here's an implementation with modularity and type signatures:

### Directory Structure
```plaintext
dspy/
│
├── __init__.py
├── main.py         # Entry point
├── gitignore.py    # Handles .gitignore parsing
├── grep.py         # Implements regex matching logic
└── utils.py        # Utility functions
```

---

### Implementation

#### `gitignore.py`
```python
from pathspec import PathSpec
from pathlib import Path
from typing import List, Optional

def parse_gitignore(gitignore_path: Optional[str] = None) -> PathSpec:
    """
    Parse the .gitignore file and return a PathSpec object.
    
    Args:
        gitignore_path (Optional[str]): Path to the .gitignore file. Defaults to None.
        
    Returns:
        PathSpec: PathSpec object representing ignored patterns.
    """
    gitignore_path = gitignore_path or ".gitignore"
    if not Path(gitignore_path).exists():
        return PathSpec.from_lines("gitwildmatch", [])
    with open(gitignore_path, "r") as file:
        patterns = file.readlines()
    return PathSpec.from_lines("gitwildmatch", patterns)
```

---

#### `grep.py`
```python
import re
from pathlib import Path
from typing import Generator, Pattern, List
from .gitignore import parse_gitignore

def search_files(
    root: str, pattern: Pattern, gitignore_path: str = ".gitignore"
) -> Generator[str, None, None]:
    """
    Search for files in a directory matching a regex pattern, respecting .gitignore.

    Args:
        root (str): Root directory to search.
        pattern (Pattern): Compiled regex pattern to match.
        gitignore_path (str): Path to the .gitignore file.

    Yields:
        str: Path of matching files.
    """
    gitignore = parse_gitignore(gitignore_path)
    root_path = Path(root)
    
    for file in root_path.rglob("*"):
        if file.is_file() and not gitignore.match_file(str(file.relative_to(root_path))):
            with open(file, "r", encoding="utf-8", errors="ignore") as f:
                if re.search(pattern, f.read()):
                    yield str(file)
```

---

#### `utils.py`
```python
import re
from typing import Pattern

def compile_regex(pattern: str) -> Pattern:
    """
    Compile a regex pattern.

    Args:
        pattern (str): Regex pattern to compile.

    Returns:
        Pattern: Compiled regex pattern.
    """
    return re.compile(pattern)
```

---

#### `main.py`
```python
import argparse
from .grep import search_files
from .utils import compile_regex

def main():
    """
    Entry point for the dspy tool.
    """
    parser = argparse.ArgumentParser(description="dspy: Regex-aware grep with .gitignore support")
    parser.add_argument("root", type=str, help="Root directory to search")
    parser.add_argument("pattern", type=str, help="Regex pattern to search for")
    parser.add_argument("--gitignore", type=str, default=".gitignore", help="Path to .gitignore file")
    
    args = parser.parse_args()
    pattern = compile_regex(args.pattern)
    
    for match in search_files(args.root, pattern, args.gitignore):
        print(match)

if __name__ == "__main__":
    main()
```

---

### Features
1. **Gitignore Support**:
   - Uses `pathspec` to parse `.gitignore` rules.
   - Ensures ignored files are skipped.

2. **Regex Matching**:
   - Supports custom regex patterns via `re`.

3. **Modular Design**:
   - Separated concerns into `gitignore.py`, `grep.py`, and `utils.py`.

4. **Command-Line Interface**:
   - Allows running the tool from the terminal with arguments.

---

### Usage
1. Install dependencies:
   ```bash
   pip install pathspec
   ```

2. Run the tool:
   ```bash
   python dspy/main.py <root_directory> <regex_pattern>
   ```

3. Example:
   ```bash
   python dspy/main.py ./src "TODO|FIXME"
   ```

This setup ensures that `.gitignore` rules are respected while performing regex-based searches in the codebase.