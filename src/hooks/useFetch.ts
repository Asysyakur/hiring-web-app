import { useEffect } from 'react'

export default function useFetch<T>(
  url: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then((data: T) => callback(data))
  }, [url, callback])
}
