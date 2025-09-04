import {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useCallback,
  Suspense,
  use,
} from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Pagination from "react-bootstrap/Pagination";
import delayedAsync from "../helper/delayedAsync";

const ClickContext = createContext();

function CardResult({ card }) {
  const { onClick } = useContext(ClickContext);
  return (
    <div className="cardResult">
      <img
        onClick={() => {
          if (onClick) onClick(card);
        }}
        src={
          card?.image_uris?.small ??
          card?.card_faces?.find((c) => c.object == "card_face")?.image_uris
            ?.small
        }
      />
    </div>
  );
}

function Loading() {
  return <Spinner animation="border" />;
}

function CardResults({ resultPromise }) {
  if (!resultPromise) {
    return <></>;
  }
  const result = use(resultPromise());

  if (!result?.data?.length) {
    return <div>No Results found</div>;
  }
  return result.data.map((m) => <CardResult key={m.id} card={m} />);
}

const fetchQuery = (query, p) =>
  fetch(
    `https://api.scryfall.com/cards/search/?q=${encodeURIComponent(
      query
    )}&page=${p}`
  ).then((r) => r.json());

function SryBoxResults({ query }) {
  const [results, setResults] = useState({});
  const [maxPages, setMaxPages] = useState(0);
  const [page, setPage] = useState(1);

  const gotoPage = (newPage) => {
    const pageInt = parseInt(newPage);
    if (!pageInt || pageInt < 1 || pageInt > maxPages) {
      return;
    }
    setPage(pageInt);
  };

  useEffect(() => {
    setMaxPages(0);
    setResults({});
    if (!query?.length) {
      return;
    }
    fetchQuery(query, 1).then((j) => {
      const m = Math.ceil(j.total_cards / 175);
      setMaxPages(m);
      const r = { 1: delayedAsync(() => Promise.resolve(j)) };
      for (let p = 2; p <= m; ++p) {
        r[p] = delayedAsync(() => fetchQuery(query, p));
      }
      setResults(r);
      setPage(1);
    });
  }, [query]);

  const PageIndicator = function () {
    if (maxPages > 1) {
      const pages = new Array(6)
        .fill(0)
        .map((_, i) => page - 3 + i)
        .filter((f) => f > 1 && f < maxPages);
      const pageIndicators = pages.map((i) => (
        <Pagination.Item
          key={i}
          active={i == page}
          onClick={useCallback(() => gotoPage(i), [query])}
        >
          {i}
        </Pagination.Item>
      ));
      return (
        <Pagination className="d-flex justify-content-center gap-1">
          <Pagination.Prev
            disabled={page == 1}
            onClick={useCallback(() => gotoPage(page - 1), [page, query])}
          />
          <Pagination.Item
            active={page == 1}
            onClick={useCallback(() => gotoPage(1), [query])}
          >
            1
          </Pagination.Item>
          <Pagination.Ellipsis
            onClick={useCallback(
              () => gotoPage(prompt("Go to page...")),
              [query]
            )}
            hidden={page < 6}
          />
          {pageIndicators}
          <Pagination.Ellipsis
            onClick={useCallback(
              () => gotoPage(prompt("Go to page...")),
              [query]
            )}
            hidden={page > maxPages - 4}
          />
          <Pagination.Item
            active={page == maxPages}
            onClick={useCallback(() => gotoPage(maxPages), [query])}
          >
            {maxPages}
          </Pagination.Item>
          <Pagination.Next
            disabled={page >= maxPages}
            onClick={useCallback(() => gotoPage(page + 1), [page, query])}
          />
        </Pagination>
      );
    }

    return <></>;
  };

  return (
    <div>
      <PageIndicator />
      <div
        className="d-flex flex-wrap overflow-y-auto"
        style={{ height: "400px" }}
      >
        {(query?.length && (
          <Suspense fallback={<Loading />}>
            <CardResults resultPromise={results[page]} />
          </Suspense>
        )) || <></>}
      </div>
    </div>
  );
}

export default function ScryBox(props) {
  const [query, setQuery] = useState("");
  const form = useRef();

  return (
    <ClickContext.Provider value={{ onClick: props.onClick }}>
      <form
        ref={form}
        onSubmit={useCallback(function (e) {
          e.preventDefault();
          const frm = new FormData(form.current);
          setQuery(frm.get("query"));
          return false;
        }, [])}
      >
        <Form.Control type="text" name="query" />
        <Button variant="primary" className="m-1" type="submit">
          Search
        </Button>
        {<SryBoxResults query={query} />}
      </form>
    </ClickContext.Provider>
  );
}
