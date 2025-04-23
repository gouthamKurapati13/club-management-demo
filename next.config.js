module.exports = {
    async rewrites() {
        return [
            {
                source: '/tables/:id',
                destination: '/tables/[id]',
            },
        ];
    },
};
