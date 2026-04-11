"use client";

import { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Input,
  Button,
  Spin,
  AutoComplete,
  Drawer,
  Collapse
} from "antd";
import {
  MessageOutlined,
  SearchOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import PriceChart from "./components/PriceChart";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

export default function Home() {
  const [ticker, setTicker] = useState("AAPL");
  const [companyName, setCompanyName] = useState("Apple Inc.");
  const [searchOptions, setSearchOptions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Mobile UI
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setChatHistory([]);
    setChatInput("");
    loadMetrics(ticker);
  }, [ticker]);

  async function loadMetrics(symbol: string) {
    try {
      const res = await fetch(`/api/metrics?symbol=${symbol}`);
      if (!res.ok) return;

      const data = await res.json();
      setMetrics(data.metrics);
      setSignals(data.signals);

      const match = searchOptions.find((o) => o.value === symbol);
      if (match) {
        const label = match.label.split("—")[1]?.trim();
        if (label) setCompanyName(label);
      }
    } catch (err) {
      console.error("Metrics error:", err);
    }
  }

  async function onSearch(value: string) {
    if (!value) return setSearchOptions([]);

    try {
      const res = await fetch(`/api/search?query=${value}`);
      if (!res.ok) return;

      const data = await res.json();
      setSearchOptions(
        data.results.map((item: any) => ({
          value: item.symbol,
          label: `${item.symbol} — ${item.name}`
        }))
      );
    } catch (err) {
      console.error("Search error:", err);
    }
  }

  async function sendMessage() {
    if (!chatInput.trim()) return;

    const userMsg = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: chatHistory,
          symbol: ticker
        })
      });

      const text = await res.text();
      if (!text) return;

      const data = JSON.parse(text);
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Agent error:", err);
    }

    setLoading(false);
  }

  function handleKeyDown(e: any) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function refreshChat() {
    setChatHistory([]);
    setChatInput("");
  }

  function interpretMetrics(m: any) {
    const out: string[] = [];

    out.push(
      m.peRatio > 35
        ? `The P/E ratio of ${m.peRatio} is elevated, suggesting strong growth expectations.`
        : m.peRatio < 12
        ? `The P/E ratio of ${m.peRatio} is relatively low, indicating possible undervaluation.`
        : `The P/E ratio of ${m.peRatio} sits within a normal valuation range.`
    );

    out.push(
      m.eps > 5
        ? `EPS of ${m.eps} reflects strong profitability.`
        : `EPS of ${m.eps} indicates moderate earnings performance.`
    );

    out.push(
      m.revenueGrowth > 0.1
        ? `Revenue growth of ${(m.revenueGrowth * 100).toFixed(1)}% indicates healthy expansion.`
        : `Revenue growth of ${(m.revenueGrowth * 100).toFixed(1)}% suggests stable but slower expansion.`
    );

    out.push(
      m.riskScore < 40
        ? `A risk score of ${m.riskScore} suggests relatively low market risk.`
        : m.riskScore > 70
        ? `A risk score of ${m.riskScore} indicates elevated volatility and uncertainty.`
        : `A risk score of ${m.riskScore} reflects moderate, manageable risk.`
    );

    out.push(
      m.volatility === "High"
        ? `High volatility suggests the stock may experience sharp price swings.`
        : m.volatility === "Low"
        ? `Low volatility indicates stable, predictable price behavior.`
        : `Volatility is moderate, reflecting balanced market movement.`
    );

    return out;
  }

  function enhancedSignals() {
    if (!metrics) return [];
    return [
      ...signals.map((s) => s.message),
      `Future outlook: Based on recent trends, ${ticker} may continue its current momentum unless major earnings or macro events shift sentiment.`,
      `Valuation context: P/E of ${metrics.peRatio} and EPS of ${metrics.eps} suggest the market expects ${ticker} to maintain stable performance.`
    ];
  }

  // Shared Chat UI
  const ChatUI = (
    <div>
      <div className="max-h-72 overflow-y-auto mb-4">
        {chatHistory.map((m, i) => (
          <div key={i} className="mb-2">
            <Text strong style={{ color: "white" }}>
              {m.role === "user" ? "You" : "Agent"}:
            </Text>
            <Text style={{ color: "white" }}>{m.content}</Text>
          </div>
        ))}
        {loading && <Text type="secondary">Thinking…</Text>}
      </div>

      <TextArea
        rows={3}
        placeholder="Ask about risk, scenarios, or signals…"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="mt-3 flex gap-2">
        <Button type="primary" onClick={sendMessage}>Send</Button>
        <Button danger icon={<ReloadOutlined />} onClick={refreshChat}>
          Refresh
        </Button>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Sider width={280} style={{ background: "#020617", padding: "16px" }}>
          <Title level={4} style={{ color: "#22c55e" }}>Exec Intel Agent</Title>
          <Text type="secondary">Financial intelligence platform</Text>

          <div className="mt-6">
            <Title level={5} style={{ color: "#22c55e", marginBottom: 4 }}>{ticker}</Title>
            <Text style={{ color: "#e5e7eb", fontSize: 13 }}>{companyName}</Text>
          </div>

          <div className="mt-4">
            <Title level={5} style={{ color: "#e5e7eb" }}>Select Ticker</Title>

            <AutoComplete
              style={{ width: "100%" }}
              options={searchOptions}
              onSearch={onSearch}
              onSelect={(val) => setTicker(val)}
              placeholder="Search ticker or company..."
            >
              <Input prefix={<SearchOutlined />} style={{ background: "#0f172a", color: "white" }} />
            </AutoComplete>
          </div>

          <div className="mt-6">
            <Title level={5} style={{ color: "#e5e7eb" }}>Key Metrics</Title>
            {!metrics && <Spin />}
            {metrics && (
              <div className="space-y-2">
                {[
                  ["Price", `$${metrics.price} (${metrics.symbol})`],
                  ["Revenue Growth", `${metrics.revenueGrowth}%`],
                  ["Volatility", metrics.volatility],
                  ["Risk Score", `${metrics.riskScore}/100`],
                  ["P/E Ratio", metrics.peRatio],
                  ["EPS", metrics.eps]
                ].map(([title, value], i) => (
                  <Card
                    key={i}
                    size="small"
                    title={title}
                    styles={{ header: { color: "white", background: "#0f172a" } }}
                    style={{ background: "#020617", color: "white" }}
                  >
                    <Text style={{ color: "white" }}>{value}</Text>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <Text style={{ color: "white", fontSize: 12 }}>
              Built using Yahoo Finance + OpenAI  
              <br />© Kyle Stewart 2026
            </Text>
          </div>
        </Sider>
      )}

      {/* MAIN LAYOUT */}
      <Layout>
        <Header style={{ background: "#020617", padding: "0 24px" }}>
          <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
            Executive Financial Intelligence
          </Title>
        </Header>

        <Content style={{ padding: 24 }}>
          {/* MOBILE HEADER */}
          {isMobile && (
            <div className="mb-4">
              <Title level={4} style={{ color: "#22c55e", marginBottom: 0 }}>{ticker}</Title>
              <Text style={{ color: "#e5e7eb" }}>{companyName}</Text>

              <div className="mt-2">
                <AutoComplete
                  style={{ width: "100%" }}
                  options={searchOptions}
                  onSearch={onSearch}
                  onSelect={(val) => setTicker(val)}
                  placeholder="Search ticker or company..."
                >
                  <Input prefix={<SearchOutlined />} style={{ background: "#0f172a", color: "white" }} />
                </AutoComplete>
              </div>

              {/* COLLAPSIBLE METRICS */}
              {metrics && (
                <Collapse className="mt-3" ghost>
                  <Panel header="Key Metrics" key="1">
                    <div className="space-y-2">
                      {[
                        ["Price", `$${metrics.price} (${metrics.symbol})`],
                        ["Revenue Growth", `${metrics.revenueGrowth}%`],
                        ["Volatility", metrics.volatility],
                        ["Risk Score", `${metrics.riskScore}/100`],
                        ["P/E Ratio", metrics.peRatio],
                        ["EPS", metrics.eps]
                      ].map(([title, value], i) => (
                        <Card
                          key={i}
                          size="small"
                          title={title}
                          styles={{ header: { color: "white", background: "#0f172a" } }}
                          style={{ background: "#020617", color: "white" }}
                        >
                          <Text style={{ color: "white" }}>{value}</Text>
                        </Card>
                      ))}
                    </div>
                  </Panel>
                </Collapse>
              )}
            </div>
          )}

          {/* DESKTOP CHAT */}
          {!isMobile && (
            <Card
              title={<><MessageOutlined /> Executive AI Agent</>}
              styles={{ header: { color: "white", background: "#0f172a" } }}
              style={{ marginBottom: 24, background: "#020617", color: "white" }}
            >
              {ChatUI}
            </Card>
          )}

          {/* MOBILE CHAT BUTTON + DRAWER */}
          {isMobile && (
            <>
              <Button
                type="primary"
                shape="circle"
                icon={<MessageOutlined />}
                size="large"
                style={{
                  position: "fixed",
                  bottom: 24,
                  right: 24,
                  zIndex: 1000,
                  background: "#22c55e",
                  borderColor: "#22c55e"
                }}
                onClick={() => setChatOpen(true)}
              />

              <Drawer
                title="Executive AI Agent"
                placement="bottom"
                height="80%"
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                bodyStyle={{ background: "#020617", color: "white" }}
              >
                {ChatUI}
              </Drawer>
            </>
          )}

          {/* METRICS SUMMARY + SIGNALS + CHART */}
          {metrics && (
            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              <Card
                title="Metrics Summary"
                styles={{ header: { color: "white", background: "#0f172a" } }}
                style={{ background: "#020617", color: "white" }}
              >
                {interpretMetrics(metrics).map((line, i) => (
                  <p key={i} style={{ color: "white", marginBottom: 8 }}>{line}</p>
                ))}
              </Card>

              <Card
                title="Signals & Outlook"
                styles={{ header: { color: "white", background: "#0f172a" } }}
                style={{ background: "#020617", color: "white" }}
              >
                {enhancedSignals().map((line, i) => (
                  <p key={i} style={{ color: "white", marginBottom: 8 }}>{line}</p>
                ))}
              </Card>

              <Card
                title="1-Year Price Chart"
                styles={{ header: { color: "white", background: "#0f172a" } }}
                style={{ background: "#020617", color: "white" }}
              >
                <PriceChart data={metrics.history} />
              </Card>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
