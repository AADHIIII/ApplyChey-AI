
export type DiffPart = {
  value: string;
  type: 'added' | 'removed' | 'unchanged';
};

/**
 * Computes the difference between two strings, character by character.
 * @param oldStr The original string.
 * @param newStr The new string.
 * @returns An array of DiffPart objects.
 */
export const diff = (oldStr: string, newStr: string): DiffPart[] => {
    // DP table to store lengths of LCS
    const dp = Array(oldStr.length + 1).fill(null).map(() => Array(newStr.length + 1).fill(0));

    // Build the DP table
    for (let i = 1; i <= oldStr.length; i++) {
        for (let j = 1; j <= newStr.length; j++) {
            if (oldStr[i - 1] === newStr[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to build the diff
    const parts: DiffPart[] = [];
    let i = oldStr.length;
    let j = newStr.length;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
            parts.unshift({ value: oldStr[i - 1], type: 'unchanged' });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            parts.unshift({ value: newStr[j - 1], type: 'added' });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            parts.unshift({ value: oldStr[i - 1], type: 'removed' });
            i--;
        } else {
            break;
        }
    }
    
    // Merge consecutive parts of the same type for efficiency
    if (parts.length === 0) return [];
    
    const merged: DiffPart[] = [parts[0]];
    for (let k = 1; k < parts.length; k++) {
        const last = merged[merged.length - 1];
        if (parts[k].type === last.type) {
            last.value += parts[k].value;
        } else {
            merged.push(parts[k]);
        }
    }

    return merged;
};

function escapeHtml(text: string): string {
  return text
     .replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#039;");
}

/**
 * Generates an HTML string from two text strings, highlighting the differences.
 * @param oldStr The original string.
 * @param newStr The new string.
 * @returns A single HTML string with inline styles for diffs.
 */
export const diffToHtml = (oldStr: string, newStr: string): string => {
    const parts = diff(oldStr, newStr);
    const html = parts.map(part => {
        const value = escapeHtml(part.value.replace(/^- /, ''));
        if (part.type === 'added') {
            return `<span class="underline decoration-green-500 decoration-2 decoration-wavy">${value}</span>`;
        }
        if (part.type === 'removed') {
            return `<span class="line-through text-destructive opacity-60">${value}</span>`;
        }
        return value;
    }).join('');

    return html;
};