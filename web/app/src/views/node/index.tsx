'use client'

import { NodeDetail } from "@/assets/type";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useKBDetail } from "@/provider/kb-provider";
import { useMobile } from "@/provider/mobile-provider";
import { useNodeList } from "@/provider/nodelist-provider";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Fab, Zoom } from "@mui/material";
import { useTiptapEditor } from "ct-tiptap-editor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Catalog from "./Catalog";
import CatalogH5 from "./CatalogH5";
import DocAnchor from "./DocAnchor";
import DocContent from "./DocContent";
import DocHeader from "./DocHeader";
import DocSearch from "./DocSearch";
import useScroll from "./useScroll";

const Doc = ({ node: defaultNode }: { node?: NodeDetail }) => {
  const { id: defaultId } = useParams()

  const { nodeList } = useNodeList()
  const { kb_id } = useKBDetail()
  const { mobile } = useMobile()

  const [id, setId] = useState(defaultId as string || '')
  const [node, setNode] = useState<NodeDetail | undefined>(defaultNode)
  const [headings, setHeadings] = useState<{ id: string, title: string, heading: number }[]>([])

  const editorRef = useTiptapEditor({
    content: node?.content || '',
    editable: false,
  })

  const { activeHeading } = useScroll(headings)

  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getData = async (id: string) => {
    try {
      const res = await fetch(`/share/v1/node/detail?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-kb-id': kb_id || '',
        }
      });
      const result = await res.json()
      setNode(result.data as NodeDetail)
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
  }

  useEffect(() => {
    if (node) {
      if (editorRef && editorRef.editor) {
        editorRef.setContent(node?.content || '').then((headings) => {
          setHeadings(headings)
        })
      }
    }
  }, [node])

  useEffect(() => {
    getData(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  if (mobile) {
    return <Box sx={{ mt: '60px', position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 42px)' }}>
      <Header />
      {nodeList && <CatalogH5 activeId={id} nodes={nodeList} onChange={setId} />}
      <Box sx={{ height: 24 }} />
      {node && <DocContent info={node} editorRef={editorRef} />}
      <Zoom in={showScrollTop}>
        <Fab
          size="small"
          onClick={scrollToTop}
          sx={{
            backgroundColor: 'background.paper',
            color: 'text.primary',
            position: 'fixed',
            bottom: 66,
            right: 16,
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 24 }} />
        </Fab>
      </Zoom>
    </Box>
  }

  return <Box>
    <Catalog activeId={id} nodes={nodeList || []} onChange={setId} />
    <DocHeader />
    <Box sx={{
      pt: '96px',
      position: 'relative',
      zIndex: 1,
      minHeight: 'calc(100vh - 40px)',
      pb: 10,
      bgcolor: 'background.default',
    }}>
      <DocSearch />
      <DocContent info={node} editorRef={editorRef} />
    </Box>
    <DocAnchor title={node?.name || ''} headings={headings} activeHeading={activeHeading} />
    <Footer />
    <Zoom in={showScrollTop}>
      <Fab
        size="small"
        onClick={scrollToTop}
        sx={{
          backgroundColor: 'background.paper',
          color: 'text.primary',
          position: 'fixed',
          bottom: 66,
          right: 16,
          zIndex: 1000,
        }}
      >
        <KeyboardArrowUpIcon sx={{ fontSize: 24 }} />
      </Fab>
    </Zoom>
  </Box>
};

export default Doc;
