import { HuffmanCode } from 'src/types/huffman';

interface OutputPanelProps {
  description: string;
  codes: HuffmanCode[];
}

export const OutputPanel = ({ description, codes }: OutputPanelProps) => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border shadow-sm">
      <div>
        <h2 className="text-lg font-semibold mb-2">Current Step</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Huffman Codes</h2>
        {codes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Codes will appear here as they are generated...</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left font-semibold">Character</th>
                  <th className="px-4 py-2 text-left font-semibold">Frequency</th>
                  <th className="px-4 py-2 text-left font-semibold">Huffman Code</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.char} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-2 font-mono font-bold text-lg">{code.char}</td>
                    <td className="px-4 py-2 text-muted-foreground">{code.frequency}</td>
                    <td className="px-4 py-2 font-mono text-primary font-semibold">{code.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
