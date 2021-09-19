import dynamic from 'next/dynamic';

const ReactAdmin = dynamic(() => import('../components/ReactAdmin'), {
  ssr: false,
});

const HomePage = () => <ReactAdmin />;

export default HomePage;
